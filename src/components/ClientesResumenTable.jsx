export default function ClientesResumenTable({ clientes, onVerDetalle }) {
  return (
    <>
      {/* ===== DESKTOP (tabla) ===== */}
      <div className="hidden md:block overflow-auto border rounded">
        <table className="min-w-full bg-gray-800 text-gray-100 rounded-lg overflow-hidden text-sm">
  <thead className="bg-gray-700 sticky top-0 z-10">
    <tr>
      <th className="p-3 text-left">Cliente</th>
      <th className="p-3 text-right">Total</th>
      <th className="p-3 text-right">Pagado</th>
      <th className="p-3 text-right">Saldo</th>
      <th className="p-3 text-center">Acciones</th>
    </tr>
  </thead>

  <tbody>
    {clientes.map((c) => (
      <tr
        key={c.id}
        className="border-b border-gray-700 hover:bg-gray-700 transition"
      >
        <td className="p-3 font-medium">{c.nombre}</td>

        <td className="p-3 text-right">
          ${c.total.toFixed(2)}
        </td>

        <td className="p-3 text-right text-green-400">
          ${c.pagado.toFixed(2)}
        </td>

        <td
          className={`p-3 text-right font-bold ${
            c.saldo > 0 ? "text-red-400" : "text-green-400"
          }`}
        >
          ${c.saldo.toFixed(2)}
        </td>

        <td className="p-3 text-center">
          <button
            onClick={() => onVerDetalle(c)}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 transition text-sm"
          >
            Ver ficha
          </button>
        </td>
      </tr>
    ))}

    {clientes.length === 0 && (
      <tr>
        <td colSpan={5} className="p-6 text-center text-gray-400">
          No hay clientes para mostrar
        </td>
      </tr>
    )}
  </tbody>
</table>

      </div>

      {/* ===== MOBILE (cards) ===== */}
      <div className="md:hidden space-y-3">
        {clientes.map((c) => (
          <div
            key={c.id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow"
          >
            <p className="text-lg font-bold">{c.nombre}</p>

            <div className="mt-2 text-sm space-y-1">
              <p>Total: ${c.total.toFixed(2)}</p>
              <p className="text-green-500">
                Pagado: ${c.pagado.toFixed(2)}
              </p>
              <p
                className={`font-bold ${
                  c.saldo > 0 ? "text-red-500" : "text-gray-400"
                }`}
              >
                Saldo: ${c.saldo.toFixed(2)}
              </p>
            </div>

            <button
              onClick={() => onVerDetalle(c)}
              className="mt-3 w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded"
            >
              Ver ficha
            </button>
          </div>
        ))}

        {clientes.length === 0 && (
          <p className="text-center text-gray-500 py-6">
            No hay clientes para mostrar
          </p>
        )}
      </div>
    </>
  );
}
