import {
    generarNumeroComprobante,
    API_URL,
    authHeaders,
    crearPago,
    crearOCrearCuentaCorriente,
} from "../services/api";
import { useState } from "react";

export default function OrdenFooter({
    total,
    fecha,
    comprobante,
    cliente,
     modoClienteNuevo,
  clienteNuevoNombre,
    patente,
    condicionCobro,
    metodoPago,
    items,
    onSuccess,
}) {
    const [loading, setLoading] = useState(false);

    const crearClienteNuevo = async () => {
        const res = await fetch(`${API_URL}/items/clientes`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({
                nombre: clienteNuevoNombre,
            }),
        });

        const data = await res.json();
        return data.data.id;
    };

    const guardarOrden = async () => {
        if (items.length === 0) return;

        try {
            setLoading(true);

            let clienteId = cliente;

            // 🔹 SI ES CLIENTE NUEVO
            if (modoClienteNuevo) {
                if (!clienteNuevoNombre) return;
                clienteId = await crearClienteNuevo();
            }

            const numeroComprobante = await generarNumeroComprobante();

            let cuentaCorrienteId = null;

if (condicionCobro === "cuenta_corriente") {
  cuentaCorrienteId = await crearOCrearCuentaCorriente(clienteId);
}
const ordenBody = {
  fecha,
  cliente: clienteId,
  comprobante: numeroComprobante,
  patente,
  condicion_cobro: condicionCobro,
  estado: condicionCobro === "contado" ? "pagado" : "pendiente",
  total,
  total_pagado: condicionCobro === "contado" ? total : 0,
  saldo: condicionCobro === "contado" ? 0 : total,
  ...(cuentaCorrienteId && { cuenta_corriente: cuentaCorrienteId }),
};

            // 1️⃣ Crear ORDEN
const ordenRes = await fetch(`${API_URL}/items/ordenes_trabajo`, {
  method: "POST",
  headers: authHeaders(),
  body: JSON.stringify(ordenBody),
});

const ordenData = await ordenRes.json();

if (!ordenRes.ok) {
  console.error("❌ Error creando orden");
  console.error(JSON.stringify(ordenData, null, 2));
  return;
}

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

            onSuccess(ordenId); // abre modal + reset
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
