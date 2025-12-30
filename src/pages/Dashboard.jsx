import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
    getDashboardOrdenes,
    getGastosPorMes,
    getPagosPorMes,
} from "../services/api";
import Card from "../components/Card";
import { useNavigate } from "react-router-dom";

/* =====================
   HELPERS
===================== */

const formatMoney = (v) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
    }).format(Number(v) || 0);

const getRangoMes = (mes) => {
    const [y, m] = mes.split("-");
    const desde = `${y}-${m}-01`;
    const ultimoDia = new Date(y, Number(m), 0).getDate();
    const hasta = `${y}-${m}-${String(ultimoDia).padStart(2, "0")}`;
    return { desde, hasta };
};

const normalizarMetodo = (m) => {
  if (Array.isArray(m)) {
    return m[0]?.toLowerCase().replace(/\s+/g, "_") || "sin_metodo";
  }
  return m?.toLowerCase().replace(/\s+/g, "_") || "sin_metodo";
};

const formatMetodoPago = (m) => {
  if (!m) return "Sin método";

  return m
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

/* =====================
   DASHBOARD
===================== */

export default function Dashboard() {
    const navigate = useNavigate();

    const [ordenes, setOrdenes] = useState([]);
    const [gastos, setGastos] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [mes, setMes] = useState("2025-12");
    const [loading, setLoading] = useState(true);

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

    /* =====================
     CÁLCULOS
  ===================== */

    // ÓRDENES
    const totalOrdenes = ordenes.length;

    const totalFacturado = ordenes.reduce(
        (a, o) => a + Number(o.total || 0),
        0
    );

    const totalCobrado = pagos.reduce((a, p) => a + Number(p.monto || 0), 0);

    const saldoPendiente = ordenes.reduce(
        (a, o) => a + Number(o.saldo || 0),
        0
    );

    const ordenesConDeuda = ordenes.filter((o) => Number(o.saldo) > 0).length;

    const ordenesPagadas = ordenes.filter(
        (o) => Number(o.saldo) === 0 && Number(o.total) > 0
    ).length;

    // GASTOS
    const totalGastos = gastos.reduce((a, g) => a + Number(g.monto || 0), 0);

    // RESULTADO
    const resultadoMes = totalCobrado - totalGastos;

    // PAGOS POR MÉTODO (✅ CORREGIDO)
    const pagosPorMetodo = pagos
        .filter((p) => Number(p.monto) > 0)
        .reduce((acc, p) => {
            const metodo = normalizarMetodo(p.metodo_pago);
            acc[metodo] = (acc[metodo] || 0) + Number(p.monto);
            return acc;
        }, {});
   const gastosPorMetodo = gastos.reduce((acc, g) => {
  const metodo = normalizarMetodo(g.metodo_pago);
  acc[metodo] = (acc[metodo] || 0) + Number(g.monto || 0);
  return acc;
}, {});


    /* =====================
     RENDER
  ===================== */

    return (
        <MainLayout>
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

            <input
                type="month"
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                className="border px-3 py-1 mb-6"
            />

            {/* MÉTRICAS PRINCIPALES */}
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
            </div>

            {/* INGRESOS POR MÉTODO */}
            <h2 className="text-xl font-bold mt-10 mb-4">
                Ingresos por método de pago
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Object.entries(pagosPorMetodo).map(([metodo, total]) => (
                    <Card
                        key={metodo}
                        title={`Ingresos ${formatMetodoPago(metodo)}`}
                        value={formatMoney(total)}
                    />
                ))}
            </div>

            {/* GASTOS / RESULTADO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                <Card title="Gastos del mes" value={formatMoney(totalGastos)} />
                <Card
                    title="Resultado del mes"
                    value={formatMoney(resultadoMes)}
                />
            </div>
            <h2 className="text-xl font-bold mt-10 mb-4">
                Gastos por método de pago
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Object.entries(gastosPorMetodo).map(([metodo, total]) => (
                    <Card
                        key={metodo}
                        title={`Gastos ${formatMetodoPago(metodo)}`}
                        value={formatMoney(total)}
                    />
                ))}
            </div>
        </MainLayout>
    );
}
