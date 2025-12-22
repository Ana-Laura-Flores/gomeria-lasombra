import { generarNumeroComprobante, API_URL, authHeaders, crearPago } from "../services/api";
import { useState } from "react";


export default function OrdenFooter({
  total,
  fecha,
  comprobante,
  cliente,
  patente,
  condicionCobro,
  metodoPago,
  items,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);

  const guardarOrden = async () => {
    if (!cliente || items.length === 0) return;

    try {
      setLoading(true);
      const numeroComprobante = await generarNumeroComprobante();

      // 1️⃣ Crear ORDEN
      const ordenRes = await fetch(`${API_URL}/items/ordenes_trabajo`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          fecha,
          cliente,
          comprobante: numeroComprobante, 
          patente,
          estado: condicionCobro === "contado" ? "pagado" : "pendiente",
          total,
          total_pagado: condicionCobro === "contado" ? total : 0,
          saldo: condicionCobro === "contado" ? 0 : total,
        }),
      });

      const ordenData = await ordenRes.json();
      const ordenId = ordenData.data.id;

      // 2️⃣ Crear ITEMS
      for (const item of items) {
        await fetch(`${API_URL}/items/items_orden`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            orden: ordenId,
            tarifa: item.tarifaId,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            subtotal: item.subtotal,
          }),
        });
      }
// 3️⃣ Crear PAGO si es contado
if (condicionCobro === "contado" && metodoPago) {
  await crearPago({
    orden: ordenId,
    metodo_pago: metodoPago,
    monto: total,
  });
}

      onSuccess(); // abre modal + reset

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="mt-6 flex justify-between items-center border-t border-gray-700 pt-4">
      <div className="text-xl font-bold">Total: $ {total}</div>

      <button
        onClick={guardarOrden}
        disabled={loading}
        className="px-6 py-3 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar orden"}
      </button>
    </div>
  );
}
