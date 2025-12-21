import { Link } from "react-router-dom";

const formatMoney = (value) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
    }).format(Number(value) || 0);

export default function CuentaCorrienteTable({ clientes, onVerDetalle }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 text-gray-100 border border-gray-700 rounded-lg">
                <thead className="bg-gray-700">
                    <tr>
                        <th className="p-2 text-left">Cliente</th>
                        <th className="p-2 text-right">Total facturado</th>
                        <th className="p-2 text-right">Pagado</th>
                        <th className="p-2 text-right">Saldo pendiente</th>
                        <th className="p-2">Detalle</th>
                        <th className="p-2">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {clientes.map((c) => (
                        <tr
                            key={c.id}
                            className="border-b border-gray-700 hover:bg-gray-700"
                        >
                            <td className="p-2">{c.nombre}</td>
                            <td className="p-2 text-right">
                                {formatMoney(c.total)}
                            </td>
                            <td className="p-2 text-right">
                                {formatMoney(c.pagado)}
                            </td>
                            <td className="p-2 text-right">
                                {formatMoney(c.saldo)}
                            </td>
                            <td className="p-2 text-center">
                                <button
                                    className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-500"
                                    onClick={() => onVerDetalle(c)}
                                >
                                    Ver órdenes
                                </button>
                            </td>
                            {/* Acciones: registrar pago y ver órdenes */}
                            <td className="p-2 space-y-1">
                                {/* Registrar pago */}
                                <Link
                                    to={`/ordenes/${o.id}`}
                                    className="block text-green-400 hover:underline"
                                >
                                    Registrar pago
                                </Link>

                                {/* Ver cada orden asociada */}
                                {c.ordenes.map((o) => (
                                    <Link
                                        key={o.id}
                                        to={`/ordenes/${o.id}`}
                                        className="block text-blue-400 hover:underline"
                                    >
                                        Ver orden #{o.id}
                                    </Link>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
