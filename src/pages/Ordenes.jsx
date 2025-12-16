import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { Link } from "react-router-dom";

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);

  useEffect(() => {
    const data =
      JSON.parse(localStorage.getItem("ordenes")) || [];
    setOrdenes(data);
  }, []);

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
              <th className="p-2">Estado</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((orden) => (
              <tr
                key={orden.id}
                className="border-b border-gray-800"
              >
                <td className="p-2">{orden.fecha}</td>
                <td className="p-2">{orden.cliente}</td>
                <td className="p-2">{orden.patente}</td>
                <td className="p-2">$ {orden.total}</td>
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
