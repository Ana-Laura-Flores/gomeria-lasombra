import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getDashboardOrdenes } from "../services/api";
import Card from "../components/Card";
const formatMoney = (value) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
    }).format(Number(value) || 0);
export default function Dashboard() {
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getDashboardOrdenes();
                setOrdenes(res.data || []);
            } catch (error) {
                console.error("Error cargando dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    if (loading)
        return (
            <MainLayout>
                <p>Cargando dashboard...</p>
            </MainLayout>
        );
    const totalOrdenes = ordenes.length;
    const totalFacturado = ordenes.reduce((acc, o) => acc + Number(o.total), 0);
    const totalCobrado = ordenes.reduce(
        (acc, o) => acc + Number(o.total_pagado),
        0
    );
    const saldoPendiente = ordenes.reduce((acc, o) => acc + Number(o.saldo), 0);
    const ordenesConDeuda = ordenes.filter((o) => Number(o.saldo) > 0).length;
    const ordenesPagadas = ordenes.filter(
        (o) => Number(o.saldo) === 0 && Number(o.total) > 0
    ).length;
    return (
        <MainLayout>
            {" "}
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>{" "}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {" "}
                <Card title="Total de órdenes" value={totalOrdenes} />{" "}
                <Card
                    title="Total facturado"
                    value={formatMoney(totalFacturado)}
                />{" "}
                <Card
                    title="Ingresos cobrados"
                    value={formatMoney(totalCobrado)}
                />{" "}
                <Card
                    title="Saldo pendiente"
                    value={formatMoney(saldoPendiente)}
                />{" "}
                <Card title="Órdenes con deuda" value={ordenesConDeuda} />{" "}
                <Card title="Órdenes pagadas" value={ordenesPagadas} />{" "}
            </div>{" "}
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
