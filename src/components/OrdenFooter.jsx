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

  // Mantenemos tu función de crear cliente exactamente igual
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
      // 🔒 SNAPSHOT SEGURO (Tal cual lo tenías)
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
        setLoading(false);
        return;
      }

      let clienteId = typeof snapshot.cliente === "object"
          ? snapshot.cliente?.id
          : snapshot.cliente;

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

    // --- NUEVA LÓGICA DE CONSECUTIVO CON SDK (CORREGIDA) ---// --- LÓGICA DE CONSECUTIVO CON "CACHE BUSTER" ---
const respuesta = await client.request(
  readItems('ordenes_trabajo', {
    sort: ['-comprobante'],
    limit: 1,
    fields: ['comprobante'],
    // 💡 Esto obliga a traer datos frescos de la DB
    query: {
       "_": Date.now() 
    }
  })
);

let ultimoNum = 0;
if (respuesta && respuesta.length > 0) {
  // Usamos [0] para el primer elemento
  ultimoNum = parseInt(respuesta[0].comprobante) || 0;
}

const siguienteComprobante = ultimoNum + 1;
const comprobanteFormateado = siguienteComprobante.toString().padStart(6, '0');


console.log("Generando comprobante:", comprobanteFormateado); // Verás "000020"
console.log("Último en DB:", ultimoNum, "Generando:", siguienteComprobante);
// -------------------------------------------------------


      // --------------------------------------------

      // 1️⃣ Crear ORDEN (Usando tus nombres de campos: condicion_cobro, comprobante, etc.)
      const ordenRes = await fetch(`${API_URL}/items/ordenes_trabajo`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          fecha: snapshot.fecha,
          cliente: clienteId,
          comprobante: comprobanteFormateado, // Inyectamos el nuevo número
          patente: snapshot.patente,
          condicion_cobro: snapshot.condicionCobro,
          estado: snapshot.condicionCobro === "contado" ? "pagado" : "pendiente",
          total: snapshot.total,
          items: snapshot.items // Asegúrate que Directus acepte el formato de tus items
        }),
      });

      const dataOrden = await ordenRes.json();
      const nuevaOrdenId = dataOrden.data.id;

      // 2️⃣ Lógica de Pagos y Cta Corriente (Exactamente como la tenías)
      if (snapshot.condicionCobro === "contado") {
        await crearPago({
          orden: nuevaOrdenId,
          monto: snapshot.total,
          metodo_pago: snapshot.metodoPago,
          fecha: snapshot.fecha,
        });
      } else {
        // Cuenta Corriente
        const cc = await getCuentaCorrienteByCliente(clienteId);
        if (cc) {
          await actualizarCuentaCorriente(cc.id, {
            saldo: parseFloat(cc.saldo) + parseFloat(snapshot.total),
          });
        }
      }

      // Finalizar con éxito
      onSuccess(nuevaOrdenId);

    } catch (error) {
      console.error("Error al guardar la orden:", error);
      alert("Error al guardar la orden");
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
