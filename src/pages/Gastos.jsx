import { useEffect, useState } from "react";
import { getGastos } from "../services/api";
import MainLayout from "../layouts/MainLayout";

export default function Gastos() {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarGastos();
  }, []);

  const cargarGastos = async () => {
    try {
      const res = await getGastos();
      setGastos(res.data);
    } catch (error) {
      console.error("Error al cargar gastos", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔢 CÁLCULOS
  const totalGastos = gastos.reduce(
    (acc, g) => acc + Number(g.monto || 0),
    0
  );

  const totalFijos = gastos
    .filter((g) => g.tipo === "FIJO")
    .reduce((acc, g) => acc + Number(g.monto || 0), 0);

  const totalVariables = gastos
    .filter((g) => g.tipo === "variable")
    .reduce((acc, g) => acc + Number(g.monto || 0), 0);

  if (loading) {
    return <p className="text-center mt-10">Cargando gastos...</p>;
  }

  return (
    <MainLayout>
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gastos</h1>

      {/* RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-4 rounded">
          <p className="text-sm text-gray-400">Total Gastos</p>
          <p className="text-xl font-bold text-red-400">
            ${totalGastos.toLocaleString("es-AR")}
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <p className="text-sm text-gray-400">Gastos Fijos</p>
          <p className="text-xl font-bold">
            ${totalFijos.toLocaleString("es-AR")}
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <p className="text-sm text-gray-400">Gastos Variables</p>
          <p className="text-xl font-bold">
            ${totalVariables.toLocaleString("es-AR")}
          </p>
        </div>
      </div>

      {/* TABLA */}
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
            {gastos.map((g) => (
              <tr
                key={g.id}
                className="border-b border-gray-800 hover:bg-gray-800"
              >
                <td className="p-3">
                  {new Date(g.fecha).toLocaleDateString("es-AR")}
                </td>
                <td className="p-3">{g.concepto}</td>
                <td className="p-3">
                  {g.categoria?.nombre || "-"}
                </td>
                <td className="p-3">{g.tipo}</td>
                <td className="p-3 text-right">
                  ${Number(g.monto).toLocaleString("es-AR")}
                </td>
              </tr>
            ))}
          </tbody>

          {/* TFOOT (ACÁ ESTABA TU PROBLEMA ANTES 😉) */}
          <tfoot className="bg-gray-800 font-bold">
            <tr>
              <td colSpan="4" className="p-3 text-right">
                Total
              </td>
              <td className="p-3 text-right text-red-400">
                ${totalGastos.toLocaleString("es-AR")}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
    </MainLayout>
  );
}
