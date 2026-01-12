import { useMemo } from "react";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(Number(value) || 0);

export default function CuentaCorrienteMovimientos({ movimientos, onVerRecibo }) {

  const movimientosConSaldo = useMemo(() => {
    let saldo = 0;
    return movimientos.map(m => {
      saldo = saldo + m.debe - m.haber;
      return { ...m, saldo };
    });
  }, [movimientos]);

  return (
    <div className="overflow-y-auto max-h-[60vh]"> {/* <-- scroll aquí */}
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
            <tr key={i} className={`border-b border-gray-700 ${m.tipo === "PAGO" ? "text-green-400" : ""}`}>
              <td className="p-2">{new Date(m.fecha).toLocaleDateString("es-AR")}</td>
              <td className="p-2 font-semibold">
                {m.tipo}
                {m.tipo === "CHEQUE" && (
                  <div className="text-sm text-gray-500">
                    Banco: {m.banco} <br />
                    Nº: {m.numero_cheque} <br />
                    Vence: {m.fecha_cobro}
                  </div>
                )}
              </td>
            <td className="p-2 text-sm">
  {m.referencia}

  {m.pago && (
    <button
      onClick={() => onVerRecibo(m.pago)}
      className="ml-2 text-blue-400 hover:underline"
    >
      Ver
    </button>
  )}
  {m.pago && !m.pago.anulado && onAnularPago && (
  <button
    onClick={() => onAnularPago(m.pago)}
    className="ml-2 bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-700"
  >
    Anular
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
