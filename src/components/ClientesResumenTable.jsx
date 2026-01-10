export default function ClientesResumenTable({ clientes, onVerDetalle }) {
  return (
    <div className="overflow-auto border rounded">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
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
  );
}
