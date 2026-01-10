import { useEffect, useMemo, useState } from "react";
import { getOrdenesTrabajo, getPagosConfirmados } from "../services/api";

export default function ClienteModal({ clienteId, onClose }) {
  const [ordenes, setOrdenes] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resOrdenes, resPagos] = await Promise.all([
          getOrdenesTrabajo(),
          getPagosConfirmados(),
        ]);

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 w-[90vw] max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Ficha del Cliente</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-3 bg-gray-100 rounded">
            <p className="text-sm">Total facturado</p>
            <p className="text-xl font-bold">${resumen.total}</p>
          </div>
          <div className="p-3 bg-green-100 rounded">
            <p className="text-sm">Pagado</p>
            <p className="text-xl font-bold">${resumen.pagado}</p>
          </div>
          <div className="p-3 bg-red-100 rounded">
            <p className="text-sm">Saldo</p>
            <p className="text-xl font-bold">${resumen.saldo}</p>
          </div>
        </div>

        {/* Órdenes */}
        <h3 className="font-bold mb-2">Órdenes</h3>
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b">
              <th>Fecha</th>
              <th>Orden</th>
              <th>Condición</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((o) => (
              <tr key={o.id} className="border-b">
                <td>{o.fecha}</td>
                <td>{o.numero}</td>
                <td>{o.condicion_cobro}</td>
                <td>${o.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagos */}
        <h3 className="font-bold mb-2">Pagos</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th>Fecha</th>
              <th>Comprobante</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map((p) => (
              <tr key={p.id} className="border-b">
                <td>{p.fecha}</td>
                <td>{p.numero_comprobante}</td>
                <td>${p.monto}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
