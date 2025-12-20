import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getDashboardOrdenes, getGastosPorMes } from "../services/api";
import Card from "../components/Card";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(Number(value) || 0);

export default function Dashboard() {
  const [ordenes, setOrdenes] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mes, setMes] = useState(new Date().toISOString().slice(0, 7));

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordenesRes, gastosRes] = await Promise.all([
          getDashboardOrdenes(mes),
          getGastosPorMes(mes),
        ]);

        setOrdenes(ordenesRes.data || []);
        setGastos(gastosRes.data || []);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mes]);

  if (loading)
    return (
      <MainLayout>
        <p>Cargando dashboard...</p>
      </MainLayout>
    );

  // INGRESOS
  const totalFacturado = ordenes.reduce((acc, o) => acc + Number(o.total), 0);
  const totalCobrado = ordenes.reduce(
    (acc, o) => acc + Number(o.total_pagado),
    0
  );
  const saldoPendiente = ordenes.reduce(
    (acc, o) => acc + Number(o.saldo),
    0
  );

  // GASTOS
  const totalGastos = gastos.reduce(
    (acc, g) => acc + Number(g.monto),
    0
  );

  // RESULTADO
  const resultadoMes = totalCobrado - totalGastos;

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* Filtro mes */}
      <input
        type="month"
        value={mes}
        onChange={(e) => setMes(e.target.value)}
        className="border px-3 py-1 mb-6"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Total facturado" value={formatMoney(totalFacturado)} />
        <Card title="Ingresos cobrados" value={formatMoney(totalCobrado)} />
        <Card title="Gastos del mes" value={formatMoney(totalGastos)} />
        <Card title="Saldo pendiente" value={formatMoney(saldoPendiente)} />
        <Card title="Resultado del mes" value={formatMoney(resultadoMes)} />
      </div>

      <button
        onClick={() => navigate("/cuenta-corriente")}
        className="bg-green-600 px-4 py-2 rounded mt-6"
      >
        Ver Cuenta Corriente
      </button>
    </MainLayout>
  );
}
