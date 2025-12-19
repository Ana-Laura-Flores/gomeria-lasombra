import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Button from "../components/Button";
import { getGastos } from "../services/api-gastos";

import GastosResumen from "../components/gastos/GastosResumen";
import GastosTable from "../components/gastos/GastosTable";

export default function Gastos() {
  const navigate = useNavigate();
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarGastos();
  }, []);

  const cargarGastos = async () => {
    try {
      const res = await getGastos();
      setGastos(res.data || []);
    } catch (error) {
      console.error("Error al cargar gastos", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <p className="text-center mt-10">Cargando gastos...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gastos</h1>

          <Button onClick={() => navigate("/gastos/nuevo")}>
            + Nuevo gasto
          </Button>
        </div>

        {/* RESUMEN */}
        <GastosResumen gastos={gastos} />

        {/* TABLA */}
        <GastosTable gastos={gastos} />
      </div>
    </MainLayout>
  );
}
