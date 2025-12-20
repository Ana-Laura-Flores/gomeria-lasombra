import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getDashboardOrdenes, getGastos } from "../services/api";
import Card from "../components/Card";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(Number(value) || 0);

export default function Dashboard() {
  const navigate = useNavigate();

  const [ordenes, setOrdenes] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 📆 MES ACTUAL (YYYY-MM)
  const [mes, setMes] = useState(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordRes, gasRes] = await Promise.all([
          getDashboardOrdenes(),
          getGastos(),
        ]);

        setOrdenes(ordRes.data || []);
        setGastos(gasRes.data || []);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <p>Cargando dashboard...</p>
      </MainLayout>
    );
  }

  // 🔎 FILTRO POR MES (string contra string)
  const ordenesMes = ordenes.filter(
    (o) => o.fecha && o.fecha.slice(0, 7) === mes
  );

  const gastosMes = gastos.filter(
    (g) => g.fecha && g.fecha.slice(0, 7) === mes
  );

  // 📊 INGRESOS (LO QUE YA ANDABA)
  const totalOrdenes = ordenesMes.length;

  const totalFacturado = ordenesMes.reduce(
    (acc, o) => acc + Number(o.total),
    0
  );

  const totalCobrado = ordenesMes.reduce(
    (acc, o) => acc + Number(o.total_pagado),
    0
  );

  const saldoPendiente = ordenesMes.reduce(
    (acc, o) => acc + Number(o.saldo),
    0
  );

  const ordenesConDeuda = ordenesMes.filter(
    (o) => Number(o.saldo) > 0
  ).length;

  const ordenesPagadas = ordenesMes.filter(
    (o) => Number(o.saldo) === 0 && Number(o.total) > 0
  ).length;

  // 📉 GASTOS
  const totalGastos = gastosMes.reduce(
    (acc, g) => acc + Number(g.monto || 0),
    0
  );

  // 📈 RESULTADO
  const resultadoMes = totalCobrado - totalGastos;

  return (
    <MainLayout>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <input
          type="month"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          className="bg-gray-800 p-2 rounded"
        />
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Total de órdenes" value={totalOrdenes} />
        <Card title="Total facturado" value={formatMoney(totalFacturado)} />
        <Card title="Ingresos cobrados" value={formatMoney(totalCobrado)} />
        <Card title="Gastos del mes" value={formatMoney(totalGastos)} />
        <Card title="Saldo pendiente" value={formatMoney(saldoPendiente)} />
        <Card
          title="Resultado del mes"
          value={formatMoney(resultadoMes)}
        />
        <Card title="Órdenes con deuda" value={ordenesConDeuda} />
        <Card title="Órdenes pagadas" value={ordenesPagadas} />
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
