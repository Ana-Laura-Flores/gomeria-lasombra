import { useState } from "react";
import {
  crearPago,
  actualizarOrden,
  impactarPagoEnCuentaCorriente,
  getCuentaCorrienteByCliente
} from "../../services/api";
import { useMetodoPago } from "../../hooks/useMetodoPago";

const calcularEstadoOrden = (total, totalPagadoAnterior, nuevoMonto) => {
  const totalPagado = Number(totalPagadoAnterior || 0) + Number(nuevoMonto || 0);
  const saldo = Math.max(Number(total) - totalPagado, 0);
  const clienteId = typeof cliente === "object" ? cliente.id : cliente;


  let estado = "pendiente";
  if (totalPagado > 0 && saldo > 0) estado = "parcial";
  if (saldo === 0) estado = "pagado";

  return { totalPagado, saldo, estado };
};

export default function PagoForm({ ordenes, cliente, onPagoRegistrado }) {
  const metodos = useMetodoPago();

  const [pagos, setPagos] = useState([]);
  const [pagoActual, setPagoActual] = useState({
    metodo: "",
    monto: "",
    banco: "",
    numero_cheque: "",
    fecha_cobro: "",
  });

  const [loading, setLoading] = useState(false);

  const totalPagos = pagos.reduce((acc, p) => acc + Number(p.monto || 0), 0);

  const agregarPago = () => {
    if (!pagoActual.metodo || !pagoActual.monto) {
      alert("Completá método y monto");
      return;
    }

    if (
      pagoActual.metodo === "cheque" &&
      (!pagoActual.banco || !pagoActual.numero_cheque || !pagoActual.fecha_cobro)
    ) {
      alert("Completá todos los datos del cheque");
      return;
    }

    setPagos([...pagos, pagoActual]);
    setPagoActual({ metodo: "", monto: "", banco: "", numero_cheque: "", fecha_cobro: "" });
  };

  const eliminarPago = (index) => setPagos(pagos.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pagos.length === 0) return;
    setLoading(true);

    try {
      // Obtener la cuenta corriente del cliente
      const ccRes = await getCuentaCorrienteByCliente(clienteId);
      const cuentaCorriente = ccRes.data[0];

      if (!cuentaCorriente && ordenes.some(o => o.condicion_cobro === "cuenta_corriente")) {
        throw new Error("La cuenta corriente del cliente no existe. La orden debe crearla primero.");
      }

      // Crear pagos
      for (const pago of pagos) {
        await crearPago({
          cliente: clienteId,
          metodo_pago: pago.metodo,
          monto: pago.monto,
          banco: pago.banco || null,
          numero_cheque: pago.numero_cheque || null,
          fecha_cobro: pago.fecha_cobro || null,
          ordenes: ordenes.map(o => o.id), // si un pago puede impactar varias órdenes
        });
      }

      // Impactar en cuenta corriente si corresponde
      if (cuentaCorriente) {
        await impactarPagoEnCuentaCorriente(cuentaCorriente.id, totalPagos);
      }

      // Actualizar órdenes
      for (const o of ordenes) {
        const { totalPagado, saldo, estado } = calcularEstadoOrden(o.total, o.total_pagado, totalPagos);
        await actualizarOrden(o.id, { total_pagado: totalPagado, saldo, estado });
      }

      onPagoRegistrado();
    } catch (err) {
      console.error(err);
      alert("Error al registrar el pago: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded space-y-4">
      <h2 className="font-semibold text-lg">Registrar pago</h2>

      {/* MÉTODO */}
      <select
        value={pagoActual.metodo}
        onChange={(e) => setPagoActual({ ...pagoActual, metodo: e.target.value })}
        className="w-full p-2 bg-gray-700 rounded"
      >
        <option value="">Seleccionar método</option>
        {metodos.map((m) => (
          <option key={m.value} value={m.value}>{m.text}</option>
        ))}
      </select>

      {/* MONTO */}
      <input
        type="number"
        min="1"
        placeholder="Monto"
        value={pagoActual.monto}
        onChange={(e) => setPagoActual({ ...pagoActual, monto: e.target.value })}
        className="w-full p-2 bg-gray-700 rounded"
      />

      {/* DATOS CHEQUE */}
      {pagoActual.metodo === "cheque" && (
        <div className="space-y-2">
          <input
            placeholder="Banco"
            value={pagoActual.banco}
            onChange={(e) => setPagoActual({ ...pagoActual, banco: e.target.value })}
            className="w-full p-2 bg-gray-700 rounded"
          />
          <input
            placeholder="Número de cheque"
            value={pagoActual.numero_cheque}
            onChange={(e) => setPagoActual({ ...pagoActual, numero_cheque: e.target.value })}
            className="w-full p-2 bg-gray-700 rounded"
          />
          <input
            type="date"
            value={pagoActual.fecha_cobro}
            onChange={(e) => setPagoActual({ ...pagoActual, fecha_cobro: e.target.value })}
            className="w-full p-2 bg-gray-700 rounded"
          />
        </div>
      )}

      {/* AGREGAR PAGO */}
      <button type="button" onClick={agregarPago} className="bg-blue-600 px-4 py-2 rounded w-full">
        Agregar pago
      </button>

      {/* LISTA DE PAGOS */}
      {pagos.length > 0 && (
        <div className="space-y-2">
          {pagos.map((p, i) => (
            <div key={i} className="bg-gray-700 p-2 rounded flex justify-between items-start">
              <div>
                <p className="font-semibold">{p.metodo} – ${p.monto}</p>
                {p.metodo === "cheque" && (
                  <p className="text-sm text-gray-300">{p.banco} | Nº {p.numero_cheque} | {p.fecha_cobro}</p>
                )}
              </div>
              <button type="button" onClick={() => eliminarPago(i)} className="text-red-400 text-sm">Quitar</button>
            </div>
          ))}
          <p className="text-right font-semibold">Total pagos: ${totalPagos}</p>
        </div>
      )}

      {/* SUBMIT */}
      <button disabled={loading} className="bg-green-600 px-4 py-2 rounded w-full">
        {loading ? "Guardando..." : "Confirmar pagos"}
      </button>
    </form>
  );
}
