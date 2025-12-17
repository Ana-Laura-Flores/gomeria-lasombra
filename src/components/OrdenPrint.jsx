import React from "react";
import logo from "../assets/logo.png"; // ajustá la ruta

export default function OrdenPrint({ orden }) {
  if (!orden) return null;

  const formatMoney = (v) =>
    Number(v).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    });

  return (
    <div
      id="orden-print"
      className="bg-white text-black p-4"
      style={{
        width: "148mm",
        minHeight: "210mm",
        fontSize: "12px",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <img src={logo} alt="Logo" className="h-12" />
        <div className="text-right">
          <h2 className="text-lg font-bold">ORDEN DE TRABAJO</h2>
          <p>N° {orden.comprobante_numero || orden.id}</p>
        </div>
      </div>

      {/* Datos */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div><strong>Fecha:</strong> {orden.fecha}</div>
        <div><strong>Patente:</strong> {orden.patente}</div>
        <div>
          <strong>Cliente:</strong>{" "}
          {orden.cliente?.nombre || orden.cliente}
        </div>
        <div><strong>Estado:</strong> {orden.estado}</div>
      </div>

      {/* Items */}
      <table className="w-full border text-xs mb-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-1 border">Servicio</th>
            <th className="p-1 border text-right">Precio</th>
          </tr>
        </thead>
        <tbody>
          {orden.items_orden?.map((item, i) => (
            <tr key={i}>
              <td className="p-1 border">
                {item.tarifa?.servicio?.nombre || "—"}
              </td>
              <td className="p-1 border text-right">
                {formatMoney(item.tarifa?.precio)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totales */}
      <div className="text-right space-y-1">
        <div>Total: {formatMoney(orden.total)}</div>
        <div>Pagado: {formatMoney(orden.total_pagado)}</div>
        <div className="font-bold">
          Saldo: {formatMoney(orden.saldo)}
        </div>
      </div>
    </div>
  );
}
