const formatMoney = (value) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(Number(value) || 0);

export default function CuentaCorrienteTable({ clientes, onVerDetalle }) {
  if (!clientes || clientes.length === 0) {
    return (
      <p className="text-center text-gray-400">No hay clientes con cuenta corriente</p>
    );
  }

  return (
  <>
    {/* ================= MOBILE: CARDS ================= */}
    <div className="space-y-3 md:hidden">
      {clientes.map((c) => (
        <div
          key={c.id}
          className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow"
        >
          <p className="font-semibold text-lg">{c.nombre}</p>

          <div className="grid grid-cols-2 gap-3 text-sm mt-3">
            <div>
              <span className="text-gray-400">Facturado</span>
              <p>{formatMoney(c.total)}</p>
            </div>

            <div>
              <span className="text-gray-400">Pagado</span>
              <p>{formatMoney(c.pagado)}</p>
            </div>

            <div className="col-span-2">
              <span className="text-gray-400">Saldo pendiente</span>
              <p
                className={`font-semibold ${
                  c.saldo > 0 ? "text-red-400" : "text-green-400"
                }`}
              >
                {formatMoney(c.saldo)}
              </p>
            </div>
          </div>

          <button
            className="w-full mt-4 bg-blue-600 py-2 rounded hover:bg-blue-500"
            onClick={() => onVerDetalle(c)}
          >
            Ver detalles
          </button>
        </div>
      ))}
    </div>

    {/* ================= DESKTOP: TABLA ================= */}
    <div className="hidden md:block overflow-x-auto">
      <table className="min-w-full bg-gray-800 text-gray-100 border border-gray-700 rounded-lg">
        <thead className="bg-gray-700">
          <tr>
            <th className="p-2 text-left">Cliente</th>
            <th className="p-2 text-right">Total facturado</th>
            <th className="p-2 text-right">Pagado</th>
            <th className="p-2 text-right">Saldo pendiente</th>
            <th className="p-2 text-center">Detalle</th>
          </tr>
        </thead>

        <tbody>
          {clientes.map((c) => (
            <tr
              key={c.id}
              className="border-b border-gray-700 hover:bg-gray-700"
            >
              <td className="p-2">{c.nombre}</td>
              <td className="p-2 text-right">{formatMoney(c.total)}</td>
              <td className="p-2 text-right">{formatMoney(c.pagado)}</td>
              <td
                className={`p-2 text-right font-semibold ${
                  c.saldo > 0 ? "text-red-400" : "text-green-400"
                }`}
              >
                {formatMoney(c.saldo)}
              </td>
              <td className="p-2 text-center">
                <button
                  className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-500"
                  onClick={() => onVerDetalle(c)}
                >
                  Ver detalles
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
