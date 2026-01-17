import { useState } from "react";
import { getDirectusClient } from "../lib/directus"; // Cambia la importación
import { readItems } from '@directus/sdk';
import { 
  authHeaders, 
  API_URL, 
  crearPago, 
  getCuentaCorrienteByCliente, 
  actualizarCuentaCorriente 
} from "../services/api";


let ultimoNumeroLocal = 0; 
export default function OrdenFooter({
  total, fecha, cliente, modoClienteNuevo, clienteNuevoNombre, patente, condicionCobro, metodoPago, items, onSuccess,
}) {
  const [loading, setLoading] = useState(false);

  const crearClienteNuevo = async (nombre) => {
    const res = await fetch(`${API_URL}/items/clientes`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ nombre }),
    });
    const data = await res.json();
    return data.data.id;
  };

  const guardarOrden = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const client = getDirectusClient();
      const snapshot = {
        fecha, cliente, modoClienteNuevo, clienteNuevoNombre,
        patente, condicionCobro, metodoPago, items: [...items], total,
      };

      if (!snapshot.items.length) {
        setLoading(false);
        return;
      }

      // 1. Identificar o Crear Cliente
      let clienteId = typeof snapshot.cliente === "object" ? snapshot.cliente?.id : snapshot.cliente;
      if (snapshot.modoClienteNuevo) {
        if (!snapshot.clienteNuevoNombre) {
          alert("Ingresá el nombre del cliente");
          setLoading(false);
          return;
        }
        clienteId = await crearClienteNuevo(snapshot.clienteNuevoNombre);
      }

      if (!clienteId) {
        alert("Seleccioná un cliente");
        setLoading(false);
        return;
      }

      // 2. Lógica de Consecutivo (Tu lógica actual)
      const ultimos = await client.request(
        readItems('ordenes_trabajo', {
          sort: ['-id'],
          limit: 5,
          fields: ['comprobante'],
          params: { 't': Date.now() }
        })
      );
      const numeros = ultimos.map(o => parseInt(o.comprobante) || 0);
      const maxServidor = numeros.length > 0 ? Math.max(...numeros) : 0;
      const maxReal = Math.max(maxServidor, ultimoNumeroLocal);
      const siguienteComprobanteInt = maxReal + 1;
      const comprobanteFormateado = siguienteComprobanteInt.toString().padStart(6, '0');
      ultimoNumeroLocal = siguienteComprobanteInt;

      // -------------------------------------------------------
      // 3. CREAR LA ORDEN PRIMERO
      // -------------------------------------------------------
      const ordenRes = await fetch(`${API_URL}/items/ordenes_trabajo`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          fecha: snapshot.fecha,
          cliente: clienteId,
          comprobante: comprobanteFormateado,
          patente: snapshot.patente,
          condicion_cobro: snapshot.condicionCobro,
          estado: snapshot.condicionCobro === "contado" ? "pagado" : "pendiente",
          total: snapshot.total,
          // No enviamos items aquí para evitar conflictos, los mandaremos abajo
        }),
      });

      const dataOrden = await ordenRes.json();
      if (!dataOrden.data || !dataOrden.data.id) {
        throw new Error(dataOrden.errors?.[0]?.message || "Error al crear la orden");
      }

      const nuevaOrdenId = dataOrden.data.id;
      console.log("✅ Orden creada con ID:", nuevaOrdenId);

      // -------------------------------------------------------
      // 4. GUARDAR LOS ITEMS (Ahora que ya tenemos nuevaOrdenId)
      // -------------------------------------------------------
      for (const item of snapshot.items) {
        if (
          (item.tipo_item === "servicio" && !item.tarifa) ||
          (item.tipo_item === "producto" && !item.producto)
        ) continue;

        const resItem = await fetch(`${API_URL}/items/items_orden`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            orden: nuevaOrdenId, // <--- Usamos el ID recién creado
            tipo_item: item.tipo_item,
            tarifa: item.tipo_item === "servicio" ? item.tarifa : null,
            producto: item.tipo_item === "producto" ? item.producto : null,
            cantidad: item.cantidad,
            precio_unitario: item.precio_unitario,
            subtotal: item.subtotal,
            nombre: item.nombre || "",
          }),
        });

        if (!resItem.ok) {
           console.error("Error guardando item:", await resItem.json());
        }
      }

      // -------------------------------------------------------
      // 5. STOCK Y MOVIMIENTOS
      // -------------------------------------------------------
      // =========================================================
// 🟢 LÓGICA DE STOCK CORREGIDA Y CON DEBUG
// =========================================================
try {
  const productosEnOrden = snapshot.items.filter(item => item.tipo_item === "producto");

  if (productosEnOrden.length > 0) {
    for (const item of productosEnOrden) {
      console.log(`Intentando descontar ${item.cantidad} del producto ID: ${item.producto}`);

      // A. Actualizar el stock
      const resStock = await fetch(`${API_URL}/items/productos/${item.producto}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({
          // Asegúrate que 'stock' es el nombre exacto del campo en Directus
          stock: { _sub: Number(item.cantidad) } 
        }),
      });

      if (!resStock.ok) {
        const errorBody = await resStock.json();
        console.error(`❌ Error en Producto ${item.producto}:`, errorBody);
        // Esto te dirá en la consola exactamente qué campo falta o qué falló
      } else {
        console.log(`✅ Stock actualizado para producto ${item.producto}`);
      }

      // B. Crear el movimiento (Esto ayuda a auditar si el PATCH falló pero el registro se creó)
      await fetch(`${API_URL}/items/movimientos_stock`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          producto: item.producto,
          tipo: "egreso",
          cantidad: Number(item.cantidad),
          motivo: `Venta - Orden #${nuevaOrdenId}`,
          orden: nuevaOrdenId
        }),
      });
    }
  }
} catch (stockError) {
  console.error("💥 Error crítico en el proceso de stock:", stockError);
}

      // -------------------------------------------------------
      // 6. PAGOS Y CUENTA CORRIENTE
      // -------------------------------------------------------
      if (snapshot.condicionCobro === "contado") {
        await crearPago({
          orden: nuevaOrdenId,
          monto: snapshot.total,
          metodo_pago: snapshot.metodoPago,
          fecha: snapshot.fecha,
        });
      } else {
        const resCC = await getCuentaCorrienteByCliente(clienteId);
        let cc = (resCC?.data?.length > 0) ? resCC.data[0] : null;

        if (!cc) {
          const nuevaCCRes = await fetch(`${API_URL}/items/cuenta_corriente`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ cliente: clienteId, saldo: 0 }),
          });
          const nuevaCCData = await nuevaCCRes.json();
          cc = nuevaCCData.data;
        }

        if (cc?.id) {
          const nuevoSaldo = Number(cc.saldo || 0) + Number(snapshot.total);
          await actualizarCuentaCorriente(cc.id, { saldo: nuevoSaldo });
        }
      }

      onSuccess(nuevaOrdenId);

    } catch (error) {
      console.error("Error crítico:", error);
      alert("Error al procesar la operación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-between items-center p-4 bg-gray-800 border-t">
      <div>
        <p className="text-gray-400">Total</p>
        <p className="text-2xl font-bold text-green-500">${total}</p>
      </div>
      <button
        onClick={guardarOrden}
        disabled={loading}
        className="px-6 py-2 bg-blue-600 rounded disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar Orden"}
      </button>
    </div>
  );
}
