const formatMoney = (value) =>
  new Intl.NumberFormat("es-AR", { 
    style: "currency", 
    currency: "ARS",
    maximumFractionDigits: 0 
  }).format(Number(value) || 0);

export default function CuentaCorrienteTable({ clientes, onVerDetalle }) {
  if (!clientes || clientes.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500 font-black uppercase tracking-widest text-xs">
          No hay clientes con cuenta corriente
        </p>
      </div>
    );
  }

  return (
    <>
      {/* ================= MOBILE: CARDS ================= */}
      <div className="space-y-4 md:hidden px-2">
        {clientes.map((c) => (
          <div
            key={c.id}
            onClick={() => onVerDetalle(c)} // Hacemos toda la card clicable
            className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 shadow-xl active:scale-[0.97] transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Cliente</p>
                <p className="font-black text-xl text-white uppercase tracking-tighter leading-none">
                  {c.nombre}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Saldo</p>
                <p className={`text-xl font-black font-mono ${c.saldo > 0 ? "text-red-400" : "text-green-400"}`}>
                  {formatMoney(c.saldo)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-700/50">
              <div>
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Facturado</span>
                <p className="text-gray-300 font-bold">{formatMoney(c.total)}</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Pagado</span>
                <p className="text-gray-300 font-bold">{formatMoney(c.pagado)}</p>
              </div>
            </div>

            <button
              className="w-full mt-4 bg-blue-600/10 border border-blue-500/20 text-blue-500 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all"
              onClick={(e) => {
                e.stopPropagation(); // Evita doble click si la card ya tiene el evento
                onVerDetalle(c);
              }}
            >
              Ver estado de cuenta
            </button>
          </div>
        ))}
      </div>

      {/* ================= DESKTOP: TABLA ================= */}
      <div className="hidden md:block overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="p-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Cliente</th>
              <th className="p-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Facturado</th>
              <th className="p-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Pagado</th>
              <th className="p-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Saldo Pendiente</th>
              <th className="p-4 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800">
            {clientes.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-blue-600/5 transition-colors group"
              >
                <td className="p-4">
                   <p className="font-bold text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                    {c.nombre}
                   </p>
                </td>
                <td className="p-4 text-right font-mono text-gray-400">{formatMoney(c.total)}</td>
                <td className="p-4 text-right font-mono text-gray-400">{formatMoney(c.pagado)}</td>
                <td className="p-4 text-right">
                  <span className={`font-black font-mono text-lg ${c.saldo > 0 ? "text-red-400" : "text-green-400"}`}>
                    {formatMoney(c.saldo)}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button
                    className="bg-blue-600/10 border border-blue-500/20 text-blue-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all"
                    onClick={() => onVerDetalle(c)}
                  >
                    Ver Detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}