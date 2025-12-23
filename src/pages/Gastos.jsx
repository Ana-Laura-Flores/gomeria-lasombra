import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getGastos } from "../services/api";

import FiltroMes from "../components/FiltroMes";
import GastosResumen from "../components/gastos/GastosResumen";

export default function Gastos() {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [mes, setMes] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const fetchGastos = async () => {
    try {
      const res = await getGastos();
      const normalizados = (res.data || []).map((g) => ({
        ...g,
        tipo: g.TIPO ? g.TIPO.toLowerCase() : "variable",
      }));
      setGastos(normalizados);
    } catch (error) {
      console.error("Error cargando gastos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGastos();
  }, []);

  const gastosDelMes = gastos.filter((g) => {
    const fecha = g.fecha?.slice(0, 7);
    return fecha === mes;
  });

  if (loading) {
    return (
      <MainLayout>
        <p className="text-center mt-10">Cargando gastos...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <h1 className="text-2xl font-bold">Gastos</h1>

          <div className="flex gap-3 items-center">
            <FiltroMes mes={mes} setMes={setMes} />

            <button
              onClick={() => navigate("/gastos/nuevo")}
              className="bg-green-600 px-4 py-2 rounded font-semibold"
            >
              + Nuevo gasto
            </button>
          </div>
        </div>

        {/* Resumen */}
        <GastosResumen gastos={gastosDelMes} />

        {/* 📱 MOBILE */}
        <div className="md:hidden space-y-4 mt-6">
          {gastosDelMes.map((g) => (
            <div
              key={g.id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">
                  {new Date(g.fecha).toLocaleDateString("es-AR")}
                </span>
                <span className="font-semibold">
                  ${Number(g.monto).toLocaleString("es-AR")}
                </span>
              </div>

              <p className="font-semibold">{g.concepto}</p>

              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>{g.categoria?.nombre || "-"}</span>
                <span className="capitalize">{g.tipo || "-"}</span>
              </div>
            </div>
          ))}

          {gastosDelMes.length === 0 && (
            <p className="text-center text-gray-400">
              No hay gastos este mes
            </p>
          )}
        </div>

        {/* 🖥 DESKTOP / TABLET */}
        <div className="hidden md:block overflow-x-auto bg-gray-900 rounded mt-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="p-3 text-left">Fecha</th>
                <th className="p-3 text-left">Concepto</th>
                <th className="p-3 text-left">Categoría</th>
                <th className="p-3 text-left">Tipo</th>
                <th className="p-3 text-right">Monto</th>
              </tr>
            </thead>

            <tbody>
              {gastosDelMes.map((g) => (
                <tr key={g.id} className="border-b border-gray-800">
                  <td className="p-3">
                    {new Date(g.fecha).toLocaleDateString("es-AR")}
                  </td>
                  <td className="p-3">{g.concepto}</td>
                  <td className="p-3">
                    {g.categoria?.nombre || "-"}
                  </td>
                  <td className="p-3 capitalize">
                    {g.tipo || "-"}
                  </td>
                  <td className="p-3 text-right">
                    ${Number(g.monto).toLocaleString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
