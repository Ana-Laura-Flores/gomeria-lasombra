import {
  generarNumeroComprobante,
  API_URL,
  authHeaders,
  crearPago,
  getCuentaCorrienteByCliente,
  actualizarCuentaCorriente,
  apiFetch, // ⚡ importante para refresh
} from "../services/api";
import { useState } from "react";

export default function OrdenFooter({
  total,
  fecha,
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
  const [ordenes, setOrdenes] = useState([]);

  const crearClienteNuevo = async (nombre) => {
    const headers = await authHeaders();

    const res = await fetch(`${API_URL}/items/clientes`, {
      method: "POST",
      headers,
      body: JSON.stringify({ nombre }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Error al crear cliente: ${err}`);
    }

    const data = await res.json();
    return data.data.id;
  };

  const guardarOrden = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // 🔒 Snapshot seguro
      const snapshot = {
        fecha,
        cliente,
        modoClienteNuevo,
        clienteNuevoNombre,
        patente,
        condicionCobro,
        metodoPago,
        items: [...items],
        total,
      };

      if (!snapshot.items.length) {
        alert("No hay items para guardar");
        return;
      }

      let clienteId =
        typeof snapshot.cliente === "object"
          ? snapshot.cliente?.id
          : snapshot.cliente;

      // Cliente nuevo
      if (snapshot.modoClienteNuevo) {
        if (!snapshot.clienteNuevoNombre) {
          alert("Ingresá el nombre del cliente");
          return;
        }
        clienteId = await crearClienteNuevo(snapshot.clienteNuevoNombre);
      }

      if (!clienteId) {
        alert("Seleccioná un cliente");
        return;
      }

      const comprobante = await generarNumeroComprobante();

      // 1️⃣ Crear ORDEN
      const ordenHeaders = await authHeaders();
      const ordenRes = await fetch(`${API_URL}/items/ordenes_trabajo`, {
        method: "POST",
        headers: ordenHeaders,
        body: JSON.stringify({
          fecha: snapshot.fecha,
          cliente: clienteId,
          comprobante,
          patente: snapshot.patente,
          condicion_cobro: snapshot.condicionCobro,
          estado:
            snapshot.condicionCobro === "contado" ? "pagado" : "pendiente",
          total: snapshot.total,
          total_pagado:
            snapshot.condicionCobro === "contado" ? snapshot.total : 0,
          saldo: snapshot.condicionCobro === "contado" ? 0 : snapshot.total,
        }),
      });

      if (!ordenRes.ok) {
        const err = await ordenRes.text();
        throw new Error(`Error al crear orden: ${err}`);
      }

      const ordenData = await ordenRes.json();
      const ordenId = ordenData.data.id;

      // 2️⃣ Cuenta corriente
      if (snapshot.condicionCobro === "cuenta_corriente") {
        const ccRes = await getCuentaCorrienteByCliente(clienteId);
        let cc = ccRes.data[0];

        if (!cc) {
          const ccHeaders = await authHeaders();
          const ccCreate = await fetch(`${API_URL}/items/cuenta_corriente`, {
            method: "POST",
            headers: ccHeaders,
            body: JSON.stringify({
              cliente: clienteId,
              total_ordenes: 0,
              total_pagos: 0,
              saldo: 0,
              saldo_actualizado: 0,
              activa: true,
            }),
          });

          if (!ccCreate.ok) {
            const err = await ccCreate.text();
            throw new Error(`Error al crear cuenta corriente: ${err}`);
          }

          const ccData = await ccCreate.json();
          cc = ccData.data;
        }

        await actualizarCuentaCorriente(cc.id, {
          total_ordenes: Number(cc.total_ordenes) + Number(snapshot.total),
          saldo: Number(cc.saldo) + Number(snapshot.total),
          saldo_actualizado:
            Number(cc.saldo_actualizado) + Number(snapshot.total),
        });
      }

      // 3️⃣ Items
      for (const item of snapshot.items) {
        if (
          (item.tipo_item === "servicio" && !item.tarifa) ||
          (item.tipo_item === "producto" && !item.producto)
        )
          continue;

        const itemHeaders = await authHeaders();
        const itemRes = await fetch(`${API_URL}/items/items_orden`, {
          method: "POST",
          headers: itemHeaders,
          body: JSON.stringify({
            orden: ordenId,
            tipo_item: item.tipo_item,
            tarifa: item.tipo_item === "servicio" ? item.tarifa : null,
            producto: item.tipo_item === "producto" ? item.producto : null,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            subtotal: item.subtotal,
            nombre: item.nombre || "",
          }),
        });

        if (!itemRes.ok) {
          const err = await itemRes.text();
          console.warn(`Error al crear item: ${err}`);
        }
      }

      // 4️⃣ Pago contado
      if (snapshot.condicionCobro === "contado" && snapshot.metodoPago) {
        await crearPago({
          orden: ordenId,
          metodo_pago: snapshot.metodoPago,
          monto: snapshot.total,
        });
      }

      // 5️⃣ Refresh automático
      const ordenesActualizadas = await apiFetch(
        `ordenes_trabajo?fields=id,total,total_pagado,saldo,fecha`
      );
      setOrdenes(ordenesActualizadas.data);

      onSuccess(ordenId);
    } catch (error) {
      console.error(error);
      alert("Error al guardar la orden: " + error.message);
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
