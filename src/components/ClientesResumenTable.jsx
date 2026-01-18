/* --- HELPER DE FORMATO --- */
const formatMoney = (v) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(Number(v) || 0);

export default function ClientesResumenTable({ clientes, onVerDetalle }) {
  return (
    <>
      {/* ===== DESKTOP (tabla) ===== */}
      <div className="hidden md:block overflow-hidden border border-gray-700 rounded-xl">
        <table className="min-w-full bg-gray-800 text-gray-100 text-sm">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="p-4 text-left font-bold uppercase text-xs tracking-wider text-gray-400">Cliente</th>
              <th className="p-4 text-right font-bold uppercase text-xs tracking-wider text-gray-400">Total Histórico</th>
              <th className="p-4 text-right font-bold uppercase text-xs tracking-wider text-gray-400">Total Pagado</th>
              <th className="p-4 text-right font-bold uppercase text-xs tracking-wider text-gray-400">Saldo Pendiente</th>
              <th className="p-4 text-center font-bold uppercase text-xs tracking-wider text-gray-400">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {clientes.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-gray-750 transition-colors group"
              >
                <td className="p-4 font-semibold text-gray-100">{c.nombre}</td>

                <td className="p-4 text-right font-mono text-gray-300">
                  {formatMoney(c.total)}
                </td>

                <td className="p-4 text-right font-mono text-green-400">
                  {formatMoney(c.pagado)}
                </td>

                <td
                  className={`p-4 text-right font-mono font-bold ${
                    c.saldo > 0.1 ? "text-red-400 bg-red-400/5" : "text-green-400"
                  }`}
                >
                  {formatMoney(c.saldo)}
                </td>

                <td className="p-4 text-center">
                  <button
                    onClick={() => onVerDetalle(c)}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 transition-all text-xs font-bold uppercase shadow-sm active:scale-95"
                  >
                    Ver ficha
                  </button>
                </td>
              </tr>
            ))}

            {clientes.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-gray-500 italic">
                  No se encontraron clientes con los filtros aplicados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== MOBILE (cards) ===== */}
      <div className="md:hidden space-y-4">
        {clientes.map((c) => (
          <div
            key={c.id}
            className={`bg-gray-800 border rounded-xl p-5 shadow-lg ${
                c.saldo > 0.1 ? "border-red-900/50" : "border-gray-700"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
                <p className="text-xl font-black text-white leading-none">{c.nombre}</p>
                {c.saldo > 0.1 && (
                    <span className="bg-red-500/20 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Deudor</span>
                )}
            </div>

            <div className="space-y-2 text-sm border-t border-gray-700/50 pt-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total operado:</span>
                <span className="text-gray-200 font-mono">{formatMoney(c.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total pagado:</span>
                <span className="text-green-400 font-mono">{formatMoney(c.pagado)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-gray-700/30">
                <span className="font-bold text-gray-300">SALDO:</span>
                <span className={`font-mono font-black text-lg ${c.saldo > 0.1 ? "text-red-400" : "text-green-400"}`}>
                    {formatMoney(c.saldo)}
                </span>
              </div>
            </div>

            <button
              onClick={() => onVerDetalle(c)}
              className="mt-5 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg active:scale-95"
            >
              VER FICHA COMPLETA
            </button>
          </div>
        ))}

        {clientes.length === 0 && (
          <div className="bg-gray-800/50 border border-dashed border-gray-700 rounded-xl p-10 text-center">
             <p className="text-gray-500">No hay clientes para mostrar</p>
          </div>
        )}
      </div>
    </>
  );
}