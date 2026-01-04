import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CuentaCorrienteMovimientos from "./CuentaCorrienteMovimientos";
import PagoForm from "./pagos/PagoForm";
import { exportarPDFOrden } from "../utils/exportarPDFOrden";
import CuentaCorrientePDF from "./CuentaCorrientePDF";

import {
  getOrdenesCuentaCorriente,
  getPagosPorMes,
} from "../services/api";

export default function CuentaCorrienteModal({
  clienteId,
  onClose,
  onPagoRegistrado,
}) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [ordenes, setOrdenes] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [clienteNombre, setClienteNombre] = useState("");

  const [showPago, setShowPago] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // =========================
  // CARGA DE DATOS REALES
  // =========================
  const fetchData = async () => {
    if (!clienteId) return;

    setLoading(true);
    try {
      const [resOrdenes, resPagos] = await Promise.all([
        getOrdenesCuentaCorriente(clienteId),
        getPagosPorMes("1900-01-01", "2100-01-01"),
      ]);

     const pagosCliente = (resPagos.data || []).filter((p) => {
  if (!p.cliente) return false;

  const id =
    typeof p.cliente === "object" ? p.cliente.id : p.cliente;

  return (
    String(id) === String(clienteId) &&
    p.estado === "confirmado"
  );
});


      setOrdenes(resOrdenes.data || []);
      setPagos(pagosCliente || []);

      const nombre =
        resOrdenes.data?.[0]?.cliente?.nombre ||
        pagosCliente?.[0]?.cliente?.nombre ||
        "";

      setClienteNombre(nombre);
    } catch (err) {
      console.error("Error cargando cuenta corriente:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clienteId]);

  const isReady = !loading;

  // =========================
  // MOVIMIENTOS (SEGURO)
  // =========================
  const movimientos = useMemo(() => {
    if (!isReady) return [];

    const movOrdenes = ordenes.map((o) => ({
      fecha: o.fecha,
      tipo: "ORDEN",
      referencia: (
        <Link to={`/ordenes/${o.id}`} className="text-blue-400 hover:underline">
          #{o.comprobante || o.id}
        </Link>
      ),
      debe: Number(o.total),
      haber: 0,
    }));

    const movPagos = pagos.map((p) => ({
      fecha: p.fecha,
      tipo: p.metodo_pago === "cheque" ? "CHEQUE" : "PAGO",
      referencia: p.metodo_pago || "Pago",
      debe: 0,
      haber: Number(p.monto),
      banco: p.banco || null,
      numero_cheque: p.numero_cheque || null,
      fecha_cobro: p.fecha_cobro || null,
    }));

    return [...movOrdenes, ...movPagos].sort(
      (a, b) => new Date(a.fecha) - new Date(b.fecha)
    );
  }, [isReady, ordenes, pagos]);

  // =========================
  // RESUMEN
  // =========================
  const resumen = useMemo(() => {
    if (!isReady) return { total: 0, pagado: 0, saldo: 0 };

    const total = ordenes.reduce((acc, o) => acc + Number(o.total || 0), 0);
    const pagado = pagos.reduce((acc, p) => acc + Number(p.monto || 0), 0);

    return { total, pagado, saldo: total - pagado };
  }, [isReady, ordenes, pagos]);

  // =========================
  // PAGO REGISTRADO
  // =========================
  const handlePagoRegistrado = async () => {
    setShowPago(false);
    setShowSuccess(true);
    await fetchData();        // 🔥 refresco REAL
    onPagoRegistrado?.();     // refresca listado padre
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center md:justify-center">
      <div className="bg-gray-900 w-full h-[100dvh] md:h-auto md:max-w-3xl md:rounded-lg flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">
            Cuenta corriente · {clienteNombre || clienteId}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPago(true)}
              className="bg-green-600 px-3 py-1 rounded text-sm"
            >
              Registrar pago
            </button>
            <button
              onClick={() =>
                exportarPDFOrden({
                  elementId: "cc-pdf",
                  filename: `CuentaCorriente-${clienteNombre || clienteId}.pdf`,
                })
              }
              className="bg-blue-600 px-3 py-1 rounded text-sm"
            >
              Exportar PDF
            </button>
            <button onClick={onClose} className="text-xl font-bold">
              ✕
            </button>
          </div>
        </div>

        {!isReady ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Cargando cuenta corriente...
          </div>
        ) : (
          <>
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
          </>
        )}

        {/* PDF OCULTO */}
        <div className="hidden">
          <div id="cc-pdf">
            <CuentaCorrientePDF
              cliente={{ id: clienteId, nombre: clienteNombre, ...resumen }}
              movimientos={movimientos}
            />
          </div>
        </div>

        {/* MODAL PAGO */}
        {showPago && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div className="bg-gray-900 w-full max-w-md p-4 rounded-lg">
              <PagoForm
                cliente={clienteId}
                onPagoRegistrado={handlePagoRegistrado}
              />
              <button
                onClick={() => setShowPago(false)}
                className="mt-3 w-full bg-gray-700 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* MODAL SUCCESS */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center">
            <div className="bg-gray-900 p-6 rounded-lg w-80 text-center space-y-4">
              <h2 className="text-lg font-bold">
                Pago registrado correctamente
              </h2>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  navigate(`/cuentas/${clienteId}`);
                }}
                className="bg-blue-600 w-full py-2 rounded"
              >
                Ver cuenta corriente
              </button>
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
      <p
        className={`text-lg font-bold ${
          saldo && value > 0 ? "text-red-400" : "text-green-400"
        }`}
      >
        {new Intl.NumberFormat("es-AR", {
          style: "currency",
          currency: "ARS",
        }).format(value || 0)}
      </p>
    </div>
  );
}
