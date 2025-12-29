import { useMemo } from "react";

export default function CuentaCorrienteMovimientos({ movimientos }) {
  const movimientosConSaldo = useMemo(() => {
    let saldo = 0;

    return movimientos.map(m => {
      saldo = saldo + m.debe - m.haber;
      return { ...m, saldo };
    });
  }, [movimientos]);
   return (
    <table className="min-w-full bg-gray-800 rounded">
      <thead className="bg-gray-700">
        <tr>
          <th className="p-2">Fecha</th>
          <th className="p-2">Tipo</th>
          <th className="p-2">Ref</th>
          <th className="p-2 text-right">Debe</th>
          <th className="p-2 text-right">Haber</th>
          <th className="p-2 text-right">Saldo</th>
        </tr>
      </thead>
      <tbody>
        {movimientosConSaldo.map((m, i) => (
          <tr key={i} className="border-b border-gray-700">
            <td className="p-2">
              {new Date(m.fecha).toLocaleDateString()}
            </td>
            <td className="p-2">{m.tipo}</td>
            <td className="p-2">{m.referencia}</td>
            <td className="p-2 text-right">{m.debe || ""}</td>
            <td className="p-2 text-right">{m.haber || ""}</td>
            <td className="p-2 text-right font-semibold">
              {m.saldo}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
