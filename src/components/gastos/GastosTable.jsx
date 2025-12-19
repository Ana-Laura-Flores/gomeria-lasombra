export default function GastosTable({ gastos }) {
  const total = gastos.reduce((a, g) => a + Number(g.monto || 0), 0);

  return (
    <div className="overflow-x-auto bg-gray-900 rounded">
      <table className="w-full text-sm">
        <thead className="bg-gray-800 text-gray-300">
          <tr>
            <th className="p-3 text-left">Fecha</th>
            <th className="p-3 text-left">Concepto</th>
            <th className="p-3 text-left">Categoría</th>
            <th className="p-3 text-left">Tipo</th>
            <th className="p-3 text-right">Monto</th>
          </tr>
        </thead>

        <tbody>
          {gastos.map((g) => (
            <tr
              key={g.id}
              className="border-b border-gray-800 hover:bg-gray-800"
            >
              <td className="p-3">
                {new Date(g.fecha).toLocaleDateString("es-AR")}
              </td>
              <td className="p-3">{g.concepto}</td>
              <td className="p-3">{g.categoria?.nombre || "-"}</td>
              <td className="p-3 capitalize">{g.tipo}</td>
              <td className="p-3 text-right">
                ${Number(g.monto).toLocaleString("es-AR")}
              </td>
            </tr>
          ))}
        </tbody>

        <tfoot className="bg-gray-800 font-bold">
          <tr>
            <td colSpan={4} className="p-3 text-right">
              Total
            </td>
            <td className="p-3 text-right text-red-400">
              ${total.toLocaleString("es-AR")}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
