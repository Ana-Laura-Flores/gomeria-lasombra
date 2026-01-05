import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PagoForm from "./pagos/PagoForm";
import CuentaCorrienteMovimientos from "./CuentaCorrienteMovimientos";
import CuentaCorrientePDF from "./CuentaCorrientePDF";
import { exportarPDFOrden } from "../utils/exportarPDFOrden";
import { getOrdenesTrabajo, getPagosCliente } from "../services/api";


export default function CuentaCorrienteModal({ clienteId, onClose, onPagoRegistrado }) {
  const [cliente, setCliente] = useState(null);
  const [ordenes, setOrdenes] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPago, setShowPago] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    
    if (!clienteId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [resOrdenes, resPagos] = await Promise.all([
          getOrdenesTrabajo(),
          getPagosCliente(clienteId),
        ]);

        const ordenesCC = (resOrdenes.data || []).filter(
          (o) => o.condicion_cobro === "cuenta_corriente" && String(o.cliente?.id) === String(clienteId)
        );

        const pagosConfirmados = (resPagos.data || []).filter((p) => p.estado === "confirmado");

        setOrdenes(ordenesCC);
        setPagos(pagosConfirmados);

        setCliente({
          id: clienteId,
          nombre: ordenesCC[0]?.cliente?.nombre || pagosConfirmados[0]?.cliente?.nombre || "Cliente",
        });
      } catch (e) {
        console.error("Error cargando cuenta corriente", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clienteId]);

  const movimientos = useMemo(() => {
    const movOrdenes = ordenes.map((o) => ({
      fecha: o.fecha,
      tipo: "ORDEN",
      referencia: <Link to={`/ordenes/${o.id}`} className="text-blue-400 hover:underline">#{o.comprobante || o.id}</Link>,
      debe: Number(o.total),
      haber: 0,
    }));

    const movPagos = pagos.map((p) => ({
      fecha: p.fecha || new Date().toISOString().split("T")[0],
      tipo: p.metodo_pago === "cheque" ? "CHEQUE" : "PAGO",
      referencia: p.metodo_pago || "Pago",
      debe: 0,
      haber: Number(p.monto),
      banco: p.banco || null,
      numero_cheque: p.numero_cheque || null,
      fecha_cobro: p.fecha_cobro || null,
    }));

    return [...movOrdenes, ...movPagos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }, [ordenes, pagos]);

  const resumen = useMemo(() => {
    const total = ordenes.reduce((a, o) => a + Number(o.total), 0);
    const pagado = pagos.reduce((a, p) => a + Number(p.monto), 0);
    return { total, pagado, saldo: total - pagado };
  }, [ordenes, pagos]);

  const handlePagoRegistrado = (pagosNuevos) => {
    setPagos((prev) => [...prev, ...pagosNuevos]);
    setShowPago(false);
    setShowSuccess(true);

    
  };

 const handleSuccessAction = async (accion) => {
  setShowSuccess(false);

  // Refrescar desde API
  const pagosActualizados = await getPagosCliente(clienteId);
  const confirmados = (pagosActualizados.data || []).filter(p => p.estado === "confirmado");
  setPagos(confirmados);

  // Avisar al padre con los pagos nuevos
  onPagoRegistrado?.(confirmados);

  switch (accion) {
    case "detalle":
      navigate(`/cuentas/${clienteId}`, { state: { refresh: Date.now() } });
      break;
    case "ordenes":
      navigate("/ordenes");
      break;
    case "listado":
      onClose?.();
      break;
    default:
      onClose?.();
  }
};

  if (loading) return <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center text-white">Cargando cuenta corriente...</div>;
  if (!cliente) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center md:justify-center">
      <div className="bg-gray-900 w-full h-[100dvh] md:h-auto md:max-w-3xl md:rounded-lg flex flex-col">
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">Cuenta corriente · {cliente.nombre}</h2>
          <div className="flex gap-2">
            <button onClick={() => setShowPago(true)} className="bg-green-600 px-3 py-1 rounded text-sm">Registrar pago</button>
            <button onClick={() => exportarPDFOrden({ elementId: "cc-pdf", filename: `CuentaCorriente-${cliente.nombre}.pdf` })} className="bg-blue-600 px-3 py-1 rounded text-sm">Exportar PDF</button>
            <button onClick={onClose} className="text-xl font-bold">✕</button>
          </div>
        </div>

        {/* RESUMEN */}
        <div className="grid grid-cols-3 gap-3 p-4 border-b border-gray-700">
          <Resumen label="Total" value={resumen.total} />
          <Resumen label="Pagado" value={resumen.pagado} />
          <Resumen label="Saldo" value={resumen.saldo} saldo />
        </div>

        {/* MOVIMIENTOS */}
        <div className="flex-1 overflow-y-auto p-4">
          <CuentaCorrienteMovimientos movimientos={movimientos} />
        </div>

        {/* PDF OCULTO */}
        <div className="hidden">
          <div id="cc-pdf">
            <CuentaCorrientePDF cliente={{ ...cliente, ...resumen }} movimientos={movimientos} />
          </div>
        </div>

        {/* MODAL PAGO */}
        {showPago && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div className="bg-gray-900 w-full max-w-md p-4 rounded-lg">
              <PagoForm cliente={cliente.id} onPagoRegistrado={handlePagoRegistrado} />
              <button onClick={() => setShowPago(false)} className="mt-3 w-full bg-gray-700 py-2 rounded">Cancelar</button>
            </div>
          </div>
        )}

        {/* MODAL SUCCESS */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center">
            <div className="bg-gray-900 p-6 rounded-lg w-80 text-center space-y-4">
              <h2 className="text-lg font-bold">Pago registrado correctamente</h2>
              <div className="flex flex-col gap-2">
                <button onClick={() => handleSuccessAction("detalle")} className="bg-blue-600 py-2 rounded">Ver cuenta corriente</button>
                <button onClick={() => handleSuccessAction("ordenes")} className="bg-gray-600 py-2 rounded">Volver a órdenes</button>
                <button onClick={() => handleSuccessAction("listado")} className="bg-green-600 py-2 rounded">Volver al listado</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Resumen({ label, value, saldo }) {
  return (
    <div className="bg-gray-800 p-3 rounded text-center">
      <span className="text-gray-400 text-sm">{label}</span>
      <p className={`text-lg font-bold ${saldo && value > 0 ? "text-red-400" : "text-green-400"}`}>
        {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(Number(value) || 0)}
      </p>
    </div>
  );
}
