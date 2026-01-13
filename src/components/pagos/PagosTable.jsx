import EstadoPagosBadge from "./EstadoPagosBadge";

const formatMoney = (v) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
    }).format(Number(v) || 0);

export default function PagosTable({ pagos, totalPagado, saldo, onVerRecibo, onAnularPago }) {

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
                    <th className="p-2 text-center">Recibo</th>
                    <th className="p-2 text-center">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {pagos.map((pago) => (
                    <tr key={pago.id} className="border-b border-gray-800">
                        <td className="p-2">
                            {new Date(pago.fecha).toLocaleDateString()}
                        </td>
                        <td className="p-2 capitalize">{pago.metodo_pago}</td>
                        {pago.metodo_pago === "cheque" && (
                            <div className="text-xs text-gray-400">
                                Banco: {pago.banco}
                                <br />
                                Nº {pago.numero_cheque}
                                <br />
                                Cobro:{" "}
                                {new Date(
                                    pago.fecha_cobro
                                ).toLocaleDateString()}
                            </div>
                        )}

                        <td className="p-2 text-right">
                            {formatMoney(pago.monto)}
                        </td>
                        <td className="p-2 text-center">
                            <EstadoPagosBadge estado={pago.estado} />
                        </td>
                        <td className="p-2 text-center">
  <div className="flex items-center justify-center gap-2">

    {/* VER RECIBO (pago o anulación) */}
    {pago.estado === "confirmado" && (
      <button
        onClick={() => onVerRecibo(pago.id)}
        className={`underline text-sm ${
          pago.tipo === "anulacion"
            ? "text-yellow-400 hover:text-yellow-300"
            : "text-blue-400 hover:text-blue-300"
        }`}
      >
        Ver
      </button>
    )}

    {/* BOTÓN ANULAR (solo pagos válidos) */}
    {pago.tipo === "pago" && !pago.anulado && (
      <button
        onClick={() => onAnularPago(pago)}
        className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
      >
        Anular
      </button>
    )}

    {/* ESTADO ANULADO */}
    {pago.anulado && (
      <span className="text-red-400 text-xs font-semibold">
        Anulado
      </span>
    )}

  </div>
</td>


                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr className="border-t border-gray-700 font-bold">
                    <td colSpan={2} className="p-2 text-right">
                        Total Pagado:
                    </td>
                    <td className="p-2 text-right">
                        {formatMoney(totalPagado)}
                    </td>
                    <td colSpan={3} />
                </tr>

                <tr className="font-bold">
                    <td colSpan={2} className="p-2 text-right">
                        Saldo:
                    </td>
                    <td className="p-2 text-right text-red-400">
                        {formatMoney(saldo)}
                    </td>
                    <td colSpan={3} />
                </tr>
            </tfoot>
        </table>
    );
}
