import { useState } from "react";
import { crearPago } from "../../services/api";

export default function PagoForm({ orden, onSuccess }) {
  const [monto, setMonto] = useState(orden.saldo);
  const [metodo, setMetodo] = useState("efectivo");
  const [observaciones, setObservaciones] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Number(monto) <= 0) return;
    if (Number(monto) > orden.saldo) {
      alert("El monto supera el saldo");
      return;
    }

    try {
      setSaving(true);

      await crearPago({
        orden: orden.id,
        monto,
        metodo_pago: metodo,
        observaciones,
      });

      setMonto("");
      setObservaciones("");
      onSuccess?.(); // refresca datos en Pagos.jsx
    } catch (e) {
      console.error(e);
      alert("Error al registrar pago");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded mb-6">
      <h2 className="font-semibold mb-4">Registrar nuevo pago</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label>Monto</label>
          <input
            type="number"
            className="w-full p-2 rounded bg-gray-900"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
          />
        </div>

        <div>
          <label>Método</label>
          <select
            className="w-full p-2 rounded bg-gray-900"
            value={metodo}
            onChange={(e) => setMetodo(e.target.value)}
          >
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="cuenta_corriente">Cuenta corriente</option>
          </select>
        </div>

        <div>
          <label>Observaciones</label>
          <input
            className="w-full p-2 rounded bg-gray-900"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          disabled={saving}
          className="px-4 py-2 bg-green-600 rounded"
        >
          {saving ? "Guardando..." : "Registrar pago"}
        </button>
      </div>
    </form>
  );
}