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
    const normalizados = (res.data || []).map(g => ({
      ...g,
      tipo: g.TIPO ? g.TIPO.toLowerCase() : "variable" // 👈 default si viene null
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
    return <p className="text-center mt-10">Cargando gastos...</p>;
  }

  return (
    <MainLayout>
      <div className="p-6">
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

        <GastosResumen gastos={gastosDelMes} />

        <div className="overflow-x-auto bg-gray-900 rounded">
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
                  <td className="p-3">{g.categoria?.nombre || "-"}</td>
                  <td className="p-3">{g.tipo || "-"}</td>
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
