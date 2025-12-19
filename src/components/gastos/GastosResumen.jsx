export default function GastosResumen({ gastos }) {
  const total = gastos.reduce((a, g) => a + Number(g.monto || 0), 0);
  const fijos = gastos
    .filter((g) => g.tipo === "FIJO")
    .reduce((a, g) => a + Number(g.monto || 0), 0);
  const variables = gastos
    .filter((g) => g.tipo === "variable")
    .reduce((a, g) => a + Number(g.monto || 0), 0);

  const money = (v) =>
    v.toLocaleString("es-AR", { style: "currency", currency: "ARS" });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gray-800 p-4 rounded">
        <p className="text-sm text-gray-400">Total Gastos</p>
        <p className="text-xl font-bold text-red-400">{money(total)}</p>
      </div>

      <div className="bg-gray-800 p-4 rounded">
        <p className="text-sm text-gray-400">Gastos Fijos</p>
        <p className="text-xl font-bold">{money(fijos)}</p>
      </div>

      <div className="bg-gray-800 p-4 rounded">
        <p className="text-sm text-gray-400">Gastos Variables</p>
        <p className="text-xl font-bold">{money(variables)}</p>
      </div>
    </div>
  );
}
