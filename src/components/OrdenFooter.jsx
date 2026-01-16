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
      // --- LÓGICA DE CONSECUTIVO REFORZADA (CORREGIDA) ---
      // Traemos los últimos 10 para saltar cualquier error de caché o de ordenamiento
     // --- LÓGICA DE CONSECUTIVO REFORZADA (CORREGIDA V2) ---
// --- LÓGICA DE CONSECUTIVO REFORZADA (MANTENIENDO TUS NOMBRES) ---
 // 2. CONSULTA AL SERVIDOR
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

      // 3. COMPARAR CON MEMORIA LOCAL
      // Si el servidor dice 21, pero nuestra memoria local dice 22, usamos 22.
      const maxReal = Math.max(maxServidor, ultimoNumeroLocal);
      
      const siguienteComprobanteInt = maxReal + 1;
      const comprobanteFormateado = siguienteComprobanteInt.toString().padStart(6, '0');

      // 4. ACTUALIZAR MEMORIA LOCAL PARA LA PRÓXIMA ORDEN
      ultimoNumeroLocal = siguienteComprobanteInt;

      console.log("Servidor:", maxServidor, "Local:", ultimoNumeroLocal, "Generando:", comprobanteFormateado);
// -------------------------------------------------------

// 1️⃣ Crear ORDEN (Sigue usando tus variables)
const ordenRes = await fetch(`${API_URL}/items/ordenes_trabajo`, {
  method: "POST",
  headers: authHeaders(),
  body: JSON.stringify({
    fecha: snapshot.fecha,
    cliente: clienteId,
    comprobante: comprobanteFormateado, // Tu variable
    patente: snapshot.patente,
    condicion_cobro: snapshot.condicionCobro,
    estado: snapshot.condicionCobro === "contado" ? "pagado" : "pendiente",
    total: snapshot.total,
    items: snapshot.items 
  }),
});

      const dataOrden = await ordenRes.json();

      // Validación de seguridad para el ID
      if (!dataOrden.data || !dataOrden.data.id) {
        console.error("Respuesta error Directus:", dataOrden);
        throw new Error(dataOrden.errors?.[0]?.message || "Error al crear la orden");
      }

      const nuevaOrdenId = dataOrden.data.id;


      // 2️⃣ Lógica de Pagos y Cta Corriente (Exactamente como la tenías)
            // 2️⃣ Lógica de Pagos y Cta Corriente
      if (snapshot.condicionCobro === "contado") {
        await crearPago({
          orden: nuevaOrdenId,
          monto: snapshot.total,
          metodo_pago: snapshot.metodoPago,
          fecha: snapshot.fecha,
        });
      } else {
        
  // Cuenta Corriente
  const resCC = await getCuentaCorrienteByCliente(clienteId);
  
  // 💡 CORRECCIÓN AQUÍ: Extraer el primer objeto si viene en un array
  let cc = (resCC && resCC.data && resCC.data.length > 0) ? resCC.data[0] : null;
  
  if (!cc) {
    console.log("No existe CC, creando una nueva...");
    const nuevaCCRes = await fetch(`${API_URL}/items/cuenta_corriente`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ cliente: clienteId, saldo: 0 }),
    });
    const nuevaCCData = await nuevaCCRes.json();
    cc = nuevaCCData.data; 
  }

  if (cc && cc.id) {
    await actualizarCuentaCorriente(cc.id, {
      // 💡 CORRECCIÓN: Usar parseFloat para evitar concatenación de strings
      saldo: parseFloat(cc.saldo || 0) + parseFloat(snapshot.total),
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
