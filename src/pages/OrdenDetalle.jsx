import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import React from "react";

export default function OrdenDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const ordenes = JSON.parse(localStorage.getItem("ordenes")) || [];

  // 🔥 COMPARACIÓN SEGURA
  const orden = ordenes.find(
    (o) => String(o.id) === String(id)
  );

  if (!orden) {
    return (
      <MainLayout>
        <p className="text-red-400">Orden no encontrada</p>
        <button
          onClick={() => navigate("/ordenes")}
          className="mt-4 px-4 py-2 bg-blue-600 rounded"
        >
          Volver
        </button>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-6">Detalle de Orden</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <strong>Fecha:</strong> {orden.fecha}
        </div>
        <div>
          <strong>Cliente:</strong> {orden.cliente}
        </div>
        <div>
          <strong>Patente:</strong> {orden.patente}
        </div>
      </div>

      <div className="mb-4">
        <strong>Condición:</strong> {orden.condicionCobro}
      </div>

      {orden.condicionCobro === "contado" && (
        <div className="mb-4">
          <strong>Método de pago:</strong> {orden.metodoPago}
        </div>
      )}

      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="p-2">Servicio</th>
            <th className="p-2">Cantidad</th>
            <th className="p-2">Precio</th>
            <th className="p-2">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {orden.items.map((item) => (
            <tr key={item.id} className="border-b border-gray-800">
              <td className="p-2">{item.servicio}</td>
              <td className="p-2">{item.cantidad}</td>
              <td className="p-2">$ {item.precio_unitario}</td>
              <td className="p-2">$ {item.subtotal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right text-xl font-bold">
        Total: $ {orden.total}
      </div>

      <div className="mt-6 flex gap-4">
        <button
          onClick={() => navigate("/ordenes")}
          className="px-4 py-2 bg-gray-700 rounded"
        >
          Volver
        </button>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-green-600 rounded"
        >
          Imprimir
        </button>
      </div>
    </MainLayout>
  );
}
