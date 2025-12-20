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
const getMesFromFecha = (fecha) => {
  if (!fecha) return null;

  const d = new Date(fecha);
  if (isNaN(d.getTime())) return null;

  return d.toISOString().slice(0, 7);
};

  const [mes, setMes] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // ✅ HOOK EN NIVEL SUPERIOR
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

  // 📆 FILTRO MES
  const ordenesMes = ordenes.filter(
  (o) => getMesFromFecha(o.fecha) === mes
);

const gastosMes = gastos.filter(
  (g) => getMesFromFecha(g.fecha) === mes
);


  // 📊 MÉTRICAS
  const totalOrdenes = ordenesMes.length;
  const totalFacturado = ordenesMes.reduce((a, o) => a + Number(o.total), 0);
  const totalCobrado = ordenesMes.reduce((a, o) => a + Number(o.total_pagado), 0);
  const saldoPendiente = ordenesMes.reduce((a, o) => a + Number(o.saldo), 0);

  const totalGastos = gastosMes.reduce(
    (a, g) => a + Number(g.monto || 0),
    0
  );

  const resultadoMes = totalCobrado - totalGastos;

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <input
          type="month"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          className="bg-gray-800 p-2 rounded"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Órdenes del mes" value={totalOrdenes} />
        <Card title="Facturado" value={formatMoney(totalFacturado)} />
        <Card title="Cobrado" value={formatMoney(totalCobrado)} />
        <Card title="Gastos" value={formatMoney(totalGastos)} />
        <Card title="Saldo pendiente" value={formatMoney(saldoPendiente)} />
        <Card
          title="Resultado del mes"
          value={formatMoney(resultadoMes)}
        />
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
