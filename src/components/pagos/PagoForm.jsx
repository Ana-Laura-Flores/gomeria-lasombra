import { useState } from "react";
import { crearPago } from "../../services/api";

export default function PagoForm({ ordenId }) {
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState("cuenta corriente");
  const [observaciones, setObservaciones] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    await crearPago({
      orden: ordenId,
      monto: Number(monto),
      metodo_pago: metodo,
      fecha: new Date().toISOString(),
    });

    alert("Pago registrado");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="number"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        placeholder="Monto"
      />

      <select value={metodo} onChange={(e) => setMetodo(e.target.value)}>
        <option value="efectivo">Efectivo</option>
        <option value="transferencia bancaria">Transferencia</option>
        <option value="mercado pago">Mercado Pago</option>
        <option value="cheque">Cheque</option>
        <option value="cuenta corriente">Cuenta corriente</option>
      </select>

      <textarea
        value={observaciones}
        onChange={(e) => setObservaciones(e.target.value)}
        placeholder="Observaciones"
      />

      <button className="bg-blue-600 px-4 py-2 rounded">
        Guardar pago
      </button>
    </form>
  );
}
