import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getDashboardOrdenes, getGastosPorMes, getPagosPorMes } from "../services/api";
import Card from "../components/Card";
import { useNavigate } from "react-router-dom";

const formatMoney = (v) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
    }).format(Number(v) || 0);

const getRangoMes = (mes) => {
    const [y, m] = mes.split("-");
    const desde = `${y}-${m}-01`;
    const hasta = `${y}-${m}-31`;
    return { desde, hasta };
};

export default function Dashboard() {
    const navigate = useNavigate();
    const [ordenes, setOrdenes] = useState([]);
    const [gastos, setGastos] = useState([]);
    const [mes, setMes] = useState("2025-12");
    const [loading, setLoading] = useState(true);
    const [pagos, setPagos] = useState([]);

    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            const { desde, hasta } = getRangoMes(mes);

            try {
                const [oRes, gRes, pRes] = await Promise.all([
                    getDashboardOrdenes(desde, hasta),
                    getGastosPorMes(desde, hasta),
                    getPagosPorMes(desde, hasta),
                ]);

                setOrdenes(oRes.data || []);
                setGastos(gRes.data || []);
                setPagos(pRes.data || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        cargar();
    }, [mes]);

    if (loading) return <MainLayout>Cargando…</MainLayout>;

    // === CÁLCULOS ===
    const totalFacturado = ordenes.reduce((a, o) => a + Number(o.total), 0);
    const totalCobrado = ordenes.reduce(
        (a, o) => a + Number(o.total_pagado),
        0
    );
    const saldoPendiente = ordenes.reduce((a, o) => a + Number(o.saldo), 0);

    const totalGastos = gastos.reduce((a, g) => a + Number(g.monto), 0);

    const resultadoMes = totalCobrado - totalGastos;
    const totalOrdenes = ordenes.length;
    const ordenesConDeuda = ordenes.filter((o) => Number(o.saldo) > 0).length;
    const ordenesPagadas = ordenes.filter(
        (o) => Number(o.saldo) === 0 && Number(o.total) > 0
    ).length;
    const pagosPorMetodo = pagos.reduce((acc, p) => {
        const metodo = p.metodo_pago || "sin_metodo";
        acc[metodo] = (acc[metodo] || 0) + Number(p.monto || 0);
        return acc;
    }, {});

    return (
        <MainLayout>
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <input
                type="month"
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                className="border px-3 py-1 mb-6"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Total de órdenes" value={totalOrdenes} />
                <Card title="Órdenes con deuda" value={ordenesConDeuda} />
                <Card title="Órdenes pagadas" value={ordenesPagadas} />
                <Card
                    title="Total facturado"
                    value={formatMoney(totalFacturado)}
                />
                <Card
                    title="Ingresos cobrados"
                    value={formatMoney(totalCobrado)}
                />
                <Card
                    title="Saldo pendiente por cobrar"
                    value={formatMoney(saldoPendiente)}
                />

                <h2 className="text-xl font-bold mt-10 mb-4">
                    Ingresos por método de pago
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {Object.entries(pagosPorMetodo).map(([metodo, total]) => (
                        <Card
                            key={metodo}
                            title={`Ingresos ${metodo}`}
                            value={formatMoney(total)}
                        />
                    ))}
                </div>

                <Card title="Gastos del mes" value={formatMoney(totalGastos)} />
                <Card
                    title="Resultado del mes"
                    value={formatMoney(resultadoMes)}
                />
            </div>
            <button
                onClick={() => navigate("/cuenta-corriente")}
                className="bg-green-600 px-4 py-2 rounded mt-4"
            >
                {" "}
                Ver Cuenta Corriente{" "}
            </button>{" "}
        </MainLayout>
    );
}
