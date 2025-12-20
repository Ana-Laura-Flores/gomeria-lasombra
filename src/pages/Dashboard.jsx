import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getDashboardOrdenes, getGastos } from "../services/api";

import Card from "../components/Card";
import FiltroMes from "../components/FiltroMes";
import IngresosResumen from "../components/ingresos/IngresosResumen";
import GastosResumen from "../components/gastos/GastosResumen";
import ResultadoMes from "../components/ResultadoMes";

export default function Dashboard() {
  const navigate = useNavigate();

  const [ordenes, setOrdenes] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // 📆 FILTRO POR MES (SIN Date)
  const ordenesMes = ordenes.filter(
    (o) => o.fecha && o.fecha.slice(0, 7) === mes
  );

  const gastosMes = gastos.filter(
    (g) => g.fecha && g.fecha.slice(0, 7) === mes
  );

  return (
    <MainLayout>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <FiltroMes mes={mes} setMes={setMes} />
      </div>

      {/* INGRESOS */}
      <IngresosResumen ordenes={ordenesMes} />

      {/* GASTOS */}
      <GastosResumen gastos={gastosMes} />

      {/* RESULTADO */}
      <ResultadoMes
        ingresos={ordenesMes}
        gastos={gastosMes}
      />

      {/* ACCESOS */}
      <div className="mt-6">
        <button
          onClick={() => navigate("/cuenta-corriente")}
          className="bg-green-600 px-4 py-2 rounded"
        >
          Ver Cuenta Corriente
        </button>
      </div>
    </MainLayout>
  );
}
