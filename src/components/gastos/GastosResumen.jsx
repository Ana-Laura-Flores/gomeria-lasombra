export default function GastosResumen({ gastos }) {
  const total = gastos.reduce(
    (acc, g) => acc + Number(g.monto || 0),
    0
  );

  const fijos = gastos
    .filter((g) => g.TIPO === "fijo")
    .reduce((acc, g) => acc + Number(g.monto || 0), 0);

  const variables = gastos
    .filter((g) => g.TIPO === "variable")
    .reduce((acc, g) => acc + Number(g.monto || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gray-800 p-4 rounded">
        <p className="text-sm text-gray-400">Total gastos</p>
        <p className="text-xl font-bold text-red-400">
          ${total.toLocaleString("es-AR")}
        </p>
      </div>

      <div className="bg-gray-800 p-4 rounded">
        <p className="text-sm text-gray-400">Gastos fijos</p>
        <p className="text-xl font-bold">
          ${fijos.toLocaleString("es-AR")}
        </p>
      </div>

      <div className="bg-gray-800 p-4 rounded">
        <p className="text-sm text-gray-400">Gastos variables</p>
        <p className="text-xl font-bold">
          ${variables.toLocaleString("es-AR")}
        </p>
      </div>
    </div>
  );
}
