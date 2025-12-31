import {
    generarNumeroComprobante,
    API_URL,
    authHeaders,
    crearPago,
    getCuentaCorrienteByCliente, 
    actualizarCuentaCorriente,
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

        let clienteId =
  typeof cliente === "object" ? cliente.id : cliente;

        // 🔹 SI ES CLIENTE NUEVO
        if (modoClienteNuevo) {
            if (!clienteNuevoNombre) return;
            clienteId = await crearClienteNuevo();
        }

        const numeroComprobante = await generarNumeroComprobante();

        // 1️⃣ Crear ORDEN
        const ordenRes = await fetch(`${API_URL}/items/ordenes_trabajo`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({
                fecha,
                cliente: clienteId,
                comprobante: numeroComprobante,
                patente,
                condicion_cobro: condicionCobro,
                estado: condicionCobro === "contado" ? "pagado" : "pendiente",
                total,
                total_pagado: condicionCobro === "contado" ? total : 0,
                saldo: condicionCobro === "contado" ? 0 : total,
            }),
        });

        const ordenData = await ordenRes.json();
        const ordenId = ordenData.data.id;

        // 2️⃣ Crear CUENTA CORRIENTE si corresponde
        if (condicionCobro === "cuenta_corriente") {
            let ccRes = await getCuentaCorrienteByCliente(clienteId);
            let cc = ccRes.data[0];

            if (!cc) {
                const ccCreacionRes = await fetch(`${API_URL}/items/cuenta_corriente`, {
                    method: "POST",
                    headers: authHeaders(),
                    body: JSON.stringify({
                        cliente: clienteId,
                        total_ordenes: 0,
                        total_pagos: 0,
                        saldo: 0,
                        saldo_actualizado: 0,
                        activa: true,
                    }),
                });

                const ccCreacionData = await ccCreacionRes.json();
                cc = ccCreacionData.data;
            }

            // Actualizar saldo de la cuenta corriente con la nueva orden
            await actualizarCuentaCorriente(cc.id, {
                total_ordenes: Number(cc.total_ordenes) + Number(total),
                saldo: Number(cc.saldo) + Number(total),
                saldo_actualizado: Number(cc.saldo_actualizado) + Number(total),
            });
        }

        // 3️⃣ Crear ITEMS
  // 3️⃣ Crear ITEMS
for (const item of items) {
  await fetch(`${API_URL}/items/items_orden`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      orden: ordenId,
      tipo_item: item.tipo_item,
      tarifa: item.tipo_item === "servicio" ? item.tarifa : null,  // id correcto
      producto: item.tipo_item === "producto" ? item.producto : null,  // id correcto
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.subtotal,
      nombre: item.nombre || "",  // usa el nombre que ya asignaste en el select
    }),
  });
}







        // 4️⃣ Crear PAGO si es contado
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
        alert("Error al guardar la orden");
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
