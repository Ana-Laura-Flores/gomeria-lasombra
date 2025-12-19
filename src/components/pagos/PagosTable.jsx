import EstadoPagosBadge from "./EstadosPagoBadge";

const formatMoney = (v) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(Number(v) || 0);

export default function PagosTable({ pagos }) {
  if (!pagos.length) {
    return <p className="text-gray-400">No hay pagos registrados</p>;
  }

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-gray-700">
          <th className="p-2 text-left">Fecha</th>
          <th className="p-2 text-left">Método</th>
          <th className="p-2 text-right">Monto</th>
          <th className="p-2 text-center">Estado</th>
        </tr>
      </thead>
      <tbody>
        {pagos.map((pago) => (
          <tr key={pago.id} className="border-b border-gray-800">
            <td className="p-2">
              {new Date(pago.fecha).toLocaleDateString()}
            </td>
            <td className="p-2 capitalize">{pago.metodo_pago}</td>
            <td className="p-2 text-right">
              {formatMoney(pago.monto)}
            </td>
            <td className="p-2 text-center">
              <EstadoPagosBadge estado={pago.estado} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
