import { useMemo } from "react";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(Math.abs(Number(value)) || 0);

export default function CuentaCorrienteMovimientos({ movimientos, onVerRecibo, onAnularPago }) {
 const movimientosConSaldo = useMemo(() => {
  let saldo = 0;
  return movimientos.map(m => {
    const monto = Number(m.haber);
    const esAnulacion = m.tipo === "ANULACIÓN";
    saldo = saldo + m.debe - (esAnulacion ? -monto : monto); // anulacion suma
    return { ...m, saldo };
  });
}, [movimientos]);

return (
  <div className="overflow-y-auto max-h-[60vh]">
    <table className="min-w-full bg-gray-800 text-gray-100 rounded-lg">
      <thead className="bg-gray-700 sticky top-0 z-10">
        <tr>
          <th className="p-2 text-left">Fecha</th>
          <th className="p-2 text-left">Tipo</th>
          <th className="p-2 text-left">Ref</th>
          <th className="p-2 text-right">Debe</th>
          <th className="p-2 text-right">Haber</th>
          <th className="p-2 text-right">Saldo</th>
        </tr>
      </thead>
      <tbody>
        {movimientosConSaldo.map((m, i) => (
          <tr key={i} className={`border-b border-gray-700 ${m.tipo === "PAGO" ? "text-green-400" : m.tipo === "ANULACIÓN" ? "text-red-400" : ""}`}>
            <td className="p-2">{new Date(m.fecha).toLocaleDateString("es-AR")}</td>
            <td className="p-2 font-semibold">{m.tipo}</td>
            <td className="p-2 text-sm">
              {m.referencia}
             {m.pago && m.pago.tipo === "pago" && !m.pago.anulado && (
  <>
    <button
      onClick={() => onVerRecibo(m.pago)}
      className="ml-2 text-blue-400 hover:underline"
    >
      Ver
    </button>

    <button
      onClick={() => onAnularPago(m.pago)}
      className="ml-2 bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700"
    >
      Anular
    </button>
  </>
)}

{m.pago && m.pago.tipo === "pago" && m.pago.anulado && (
  <span className="ml-2 text-red-400 font-semibold text-sm">
    Anulado
  </span>
)}

{m.pago && m.pago.tipo === "anulacion" && (
  <button
    onClick={() => onVerRecibo(m.pago)}
    className="ml-2 text-yellow-400 hover:underline text-sm"
  >
    Ver recibo de anulación
  </button>
)}

            </td>
            <td className="p-2 text-right">{m.debe ? formatMoney(m.debe) : ""}</td>
            <td className="p-2 text-right">{m.haber ? formatMoney(m.haber) : ""}</td>
            <td className="p-2 text-right font-bold">{formatMoney(m.saldo)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

}
