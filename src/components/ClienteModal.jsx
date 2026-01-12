import { useEffect, useMemo, useState } from "react";
import {
    getOrdenesTrabajo,
    getClienteById,
    getPagosConfirmados,
} from "../services/api";
import { useNavigate } from "react-router-dom";
import ReciboPagoPDF from "./ReciboPagoPdf";

export default function ClienteModal({ clienteId, onClose }) {
    const [ordenes, setOrdenes] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cliente, setCliente] = useState(null);
    const navigate = useNavigate();


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [resCliente, resOrdenes, resPagos] = await Promise.all([
                    getClienteById(clienteId),
                    getOrdenesTrabajo(),
                    getPagosConfirmados(),
                ]);

                setCliente(resCliente.data);

                const ordenesCliente = resOrdenes.data.filter(
                    (o) => o.cliente?.id === clienteId
                );

                const pagosCliente = resPagos.data.filter((p) => {
                    const id = p.cliente?.id ?? p.cliente;
                    return id === clienteId;
                });

                setOrdenes(ordenesCliente);
                setPagos(pagosCliente);
            } catch (err) {
                console.error("Error cargando cliente:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [clienteId]);

    const resumen = useMemo(() => {
        const total = ordenes.reduce((a, o) => a + Number(o.total || 0), 0);
        const pagado = pagos.reduce((a, p) => a + Number(p.monto || 0), 0);
        return {
            total,
            pagado,
            saldo: total - pagado,
        };
    }, [ordenes, pagos]);

    if (loading) return null;

    const formatFecha = (iso) => {
        if (!iso) return "";
        return new Date(iso).toLocaleDateString("es-AR");
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gray-800 text-gray-100 rounded-lg p-4 w-[90vw] max-w-4xl max-h-[90vh] overflow-auto border border-gray-700">
                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-bold">Ficha del Cliente</h2>
                    <h2 className="text-xl font-bold">
                        {cliente?.nombre || "Cliente"}
                    </h2>
                    {/* <p className="text-sm text-gray-400">
  {cliente?.telefono} · {cliente?.email}
</p> */}

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Resumen */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-3 bg-gray-700 rounded">
                        <p className="text-sm text-gray-400">Total facturado</p>
                        <p className="text-xl font-bold">${resumen.total}</p>
                    </div>
                    <div className="p-3 bg-green-900/40 rounded">
                        <p className="text-sm text-gray-400">Pagado</p>
                        <p className="text-xl font-bold text-green-400">
                            ${resumen.pagado}
                        </p>
                    </div>
                    <div className="p-3 bg-red-900/40 rounded">
                        <p className="text-sm text-gray-400">Saldo</p>
                        <p className="text-xl font-bold text-red-400">
                            ${resumen.saldo}
                        </p>
                    </div>
                </div>

                {/* Órdenes */}
                <h3 className="font-bold mb-2">Órdenes</h3>
                <table className="w-full text-sm mb-6">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="p-2 text-left">Fecha</th>
                            <th className="p-2 text-left">Orden</th>
                            <th className="p-2 text-left">Condición</th>
                            

                            <th className="p-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ordenes.map((o) => (
                            <tr
                                key={o.id}
                                className="border-b border-gray-700 hover:bg-gray-700"
                            >
                                <td className="p-2">{formatFecha(o.fecha)}</td>
                                <td
                                    className="p-2 font-mono text-blue-400 cursor-pointer hover:underline"
                                    onClick={() => navigate(`/ordenes/${o.id}`)}
                                >
                                    {o.numero || o.comprobante || `#${o.id}`}
                                </td>

                                <td className="p-2 capitalize">
                                    {o.condicion_cobro}
                                </td>
                               

                                <td className="p-2 text-right">${o.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagos */}
                <h3 className="font-bold mb-2">Pagos</h3>
<table className="w-full text-sm">
  <thead className="bg-gray-700">
    <tr>
      <th className="p-2 text-left">Fecha</th>
      <th className="p-2 text-left">Comprobante</th>
      <th className="p-2 text-left">Método</th>
      <th className="p-2 text-right">Monto</th>
    </tr>
  </thead>
  <tbody>
    {pagos.map((p) => (
  <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-700">
    <td className="p-2">{formatFecha(p.fecha)}</td>
    <td className="p-2 font-mono">
      <span
        className="text-blue-400 cursor-pointer hover:underline"
        onClick={() =>
          exportarPDFRecibo({
            elementId: `recibo-${p.id}`,
            filename: `ReciboPago-${p.numero_comprobante || p.id}.pdf`,
          })
        }
      >
        {p.numero_comprobante != null && p.numero_comprobante !== ""
          ? `Pago #${p.numero_comprobante}`
          : "Pago #—"}
      </span>
    </td>
    <td className="p-2 capitalize text-gray-300">{p.metodo_pago || "—"}</td>
    <td className="p-2 text-right text-green-400">${p.monto}</td>
  </tr>
))}

  </tbody>
</table>
<div className="hidden">
  {pagos.map((p) => (
    <div key={p.id} id={`recibo-${p.id}`}>
      <ReciboPagoPDF
        pago={p}
        cliente={cliente}
        orden={ordenes.find((o) => o.id === p.orden?.id) || {}}
      />
    </div>
  ))}
</div>


            </div>
        </div>
    );
}
