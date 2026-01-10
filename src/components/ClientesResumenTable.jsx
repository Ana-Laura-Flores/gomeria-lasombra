export default function ClientesResumenTable({ clientes, onVerDetalle }) {
  return (
    <>
      {/* ===== DESKTOP (tabla) ===== */}
      <div className="hidden md:block overflow-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-500">
            <tr>
              <th className="p-2 text-left">Cliente</th>
              <th className="p-2 text-right">Total</th>
              <th className="p-2 text-right">Pagado</th>
              <th className="p-2 text-right">Saldo</th>
              <th className="p-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-500">
                <td className="p-2 font-medium">{c.nombre}</td>
                <td className="p-2 text-right">${c.total.toFixed(2)}</td>
                <td className="p-2 text-right text-green-600">
                  ${c.pagado.toFixed(2)}
                </td>
                <td
                  className={`p-2 text-right font-bold ${
                    c.saldo > 0 ? "text-red-600" : "text-gray-500"
                  }`}
                >
                  ${c.saldo.toFixed(2)}
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => onVerDetalle(c)}
                    className="text-blue-600 hover:underline"
                  >
                    Ver ficha
                  </button>
                </td>
              </tr>
            ))}

            {clientes.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
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
