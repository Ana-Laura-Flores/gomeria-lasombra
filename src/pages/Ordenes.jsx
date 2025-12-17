import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { Link } from "react-router-dom";
import { getOrdenesTrabajo } from "../services/api";

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        const res = await getOrdenesTrabajo();
        setOrdenes(res.data || []);
      } catch (err) {
        console.error("Error cargando órdenes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrdenes();
  }, []);

  if (loading)
    return (
      <MainLayout>
        <p>Cargando órdenes...</p>
      </MainLayout>
    );

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-6">Órdenes</h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-2">Fecha</th>
              <th className="p-2">Cliente</th>
              <th className="p-2">Patente</th>
              <th className="p-2">Total</th>
              <th className="p-2">Condición</th>
              <th className="p-2">Método</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((orden) => (
              <tr key={orden.id} className="border-b border-gray-800">
                <td className="p-2">{orden.fecha}</td>
                <td className="p-2">{orden.cliente?.nombre || "-"}</td>
                <td className="p-2">{orden.patente}</td>
                <td className="p-2">
                  $ {orden.items?.reduce((acc, i) => acc + i.subtotal, 0) || 0}
                </td>
                <td className="p-2">{orden.condicionCobro}</td>
                <td className="p-2">{orden.condicionCobro === "contado" ? orden.metodoPago : "-"}</td>
                <td className="p-2">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      orden.estado === "pagado"
                        ? "bg-green-700"
                        : "bg-yellow-700"
                    }`}
                  >
                    {orden.estado}
                  </span>
                </td>
                <td className="p-2">
                  <Link
                    to={`/ordenes/${orden.id}`}
                    className="text-blue-400 hover:underline"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
