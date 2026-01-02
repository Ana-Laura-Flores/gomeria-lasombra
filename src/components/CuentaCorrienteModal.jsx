import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CuentaCorrienteMovimientos from "./CuentaCorrienteMovimientos";
import PagoForm from "./pagos/PagoForm";
import { exportarPDFOrden } from "../utils/exportarPDFOrden";
import CuentaCorrientePDF from "./CuentaCorrientePDF";
import { fetchClienteById } from "../services/api"; // Nueva función para traer cliente actualizado

export default function CuentaCorrienteModal({ clienteId, onClose }) {
  const [showPago, setShowPago] = useState(false);
  const [clienteData, setClienteData] = useState(null);

  // =========================
  // Cargar cliente al abrir modal o actualizar
  // =========================
  const cargarCliente = async () => {
    try {
      const res = await fetchClienteById(clienteId);
      setClienteData(res);
    } catch (err) {
      console.error("Error cargando cliente", err);
    }
  };

  useEffect(() => {
    cargarCliente();
  }, [clienteId]);

  if (!clienteData) return null;

  // =========================
  // Movimientos
  // =========================
  const movimientos = [
    ...clienteData.ordenes.map((o) => ({
      fecha: o.fecha,
      tipo: "ORDEN",
      referencia: (
        <Link
          to={`/ordenes/${o.id}`}
          className="text-blue-400 hover:underline"
        >
          #{o.comprobante || o.id}
        </Link>
      ),
      debe: Number(o.total),
      haber: 0,
    })),
    ...clienteData.pagos.map((p) => ({
      fecha: p.fecha,
      tipo: p.metodo_pago === "cheque" ? "CHEQUE" : "PAGO",
      referencia: p.metodo_pago || "Pago",
      debe: 0,
      haber: Number(p.monto),
      banco: p.banco || null,
      numero_cheque: p.numero_cheque || null,
      fecha_cobro: p.fecha_cobro || null,
    })),
  ].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  // =========================
  // Render
  // =========================
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center md:justify-center">
      <div className="bg-gray-900 w-full h-[100dvh] md:h-auto md:max-w-3xl md:rounded-lg flex flex-col">
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">
            Cuenta corriente · {clienteData.nombre}
          </h2>

          <div className="flex gap-2">
            <button
              onClick={() => setShowPago(true)}
              className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
            >
              Registrar pago
            </button>

            <button
              onClick={() => {
                exportarPDFOrden({
                  elementId: "cc-pdf",
                  filename: `CuentaCorriente-${clienteData.nombre}.pdf`,
                });
              }}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
            >
              Exportar PDF
            </button>

            <button onClick={onClose} className="text-xl font-bold">
              ✕
            </button>
          </div>
        </div>

        {/* RESUMEN */}
        <div className="grid grid-cols-3 gap-3 p-4 border-b border-gray-700">
          <Resumen label="Total" value={clienteData.total} />
          <Resumen label="Pagado" value={clienteData.pagado} />
          <Resumen label="Saldo" value={clienteData.saldo} saldo />
        </div>

        {/* MOVIMIENTOS */}
        <div className="flex-1 overflow-y-auto p-4">
          <CuentaCorrienteMovimientos movimientos={movimientos} />
        </div>

        {/* PDF OCULTO */}
        <div className="hidden">
          <div id="cc-pdf">
            <CuentaCorrientePDF cliente={clienteData} movimientos={movimientos} />
          </div>
        </div>

        {/* MODAL REGISTRAR PAGO */}
        {showPago && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div className="bg-gray-900 w-full max-w-md p-4 rounded-lg">
              <PagoForm
                cliente={clienteData.id}
                onPagoRegistrado={async () => {
                  await cargarCliente(); // 🔄 recarga cliente desde backend
                  setShowPago(false); // cierra modal
                }}
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
      </div>
    </div>
  );
}

/* -------------------- */
/* SUBCOMPONENTE RESUMEN */
/* -------------------- */
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
        }).format(Number(value) || 0)}
      </p>
    </div>
  );
}
