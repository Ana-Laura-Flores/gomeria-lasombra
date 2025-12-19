import { useState } from "react";
import { crearPago, actualizarOrden } from "../../services/api";

const calcularEstadoOrden = (total, totalPagadoAnterior, nuevoMonto) => {
  const totalPagado =
    Number(totalPagadoAnterior || 0) + Number(nuevoMonto || 0);

  const saldo = Math.max(Number(total) - totalPagado, 0);

  let estado = "pendiente";
  if (totalPagado > 0 && saldo > 0) estado = "parcial";
  if (saldo === 0) estado = "pagado";

  return { totalPagado, saldo, estado };
};

export default function PagoForm({ orden, onPagoRegistrado }) {
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState("efectivo");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const montoNumerico = Number(monto);

    // 1️⃣ Crear pago
    await crearPago({
      orden: orden.id,
      metodo_pago: metodo,
      monto: montoNumerico,
    });

    // 2️⃣ Recalcular usando datos ACTUALES de la orden
    const { totalPagado, saldo, estado } = calcularEstadoOrden(
      orden.total,
      orden.total_pagado,
      montoNumerico
    );

    // 3️⃣ Actualizar orden
    await actualizarOrden(orden.id, {
      total_pagado: totalPagado,
      saldo,
      estado,
    });

    setMonto("");
    setLoading(false);
    onPagoRegistrado(); // recargar orden / pagos
    navigate("/dashboard");

  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 p-4 rounded space-y-4"
    >
      <h2 className="font-semibold">Registrar pago</h2>

      <select
        value={metodo}
        onChange={(e) => setMetodo(e.target.value)}
        className="w-full p-2 bg-gray-700 rounded"
      >
        <option value="efectivo">Efectivo</option>
        <option value="transferencia">Transferencia</option>
        <option value="mercado_pago">Mercado Pago</option>
        <option value="cuenta_corriente">Cuenta Corriente</option>
        <option value="cheque">Cheque</option>
      </select>

      <input
        type="number"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        placeholder="Monto"
        className="w-full p-2 bg-gray-700 rounded"
        required
        min="1"
      />

      <button
        disabled={loading}
        className="bg-green-600 px-4 py-2 rounded"
      >
        {loading ? "Guardando..." : "Registrar pago"}
      </button>
    </form>
  );
}
