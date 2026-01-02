import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CuentaCorrienteMovimientos from "./CuentaCorrienteMovimientos";
import PagoForm from "./pagos/PagoForm";
import { exportarPDFOrden } from "../utils/exportarPDFOrden";


export default function CuentaCorrienteModal({ cliente, onClose, onPagoRegistrado }) {
  const [showPago, setShowPago] = useState(false);

  // Movimientos combinados con referencia y tipo
  const movimientos = useMemo(() => {
    const ordenes = cliente.ordenes.map(o => ({
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

    const pagos = cliente.pagos.map(p => ({
      fecha: p.fecha,
      tipo: p.metodo_pago === "cheque" ? "CHEQUE" : "PAGO",
      referencia: p.metodo_pago || "Pago",
      debe: 0,
      haber: Number(p.monto),
      banco: p.banco || null,
      numero_cheque: p.numero_cheque || null,
      fecha_cobro: p.fecha_cobro || null,
    }));

    return [...ordenes, ...pagos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }, [cliente]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center md:justify-center">
      <div className="bg-gray-900 w-full h-[100dvh] md:h-auto md:max-w-3xl md:rounded-lg flex flex-col">
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">Cuenta corriente · {cliente.nombre}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPago(true)}
              className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
            >
              Registrar pago
            </button>
            <button
  onClick={() =>
    exportarPDFOrden({
      elementId: "cc-pdf",
      filename: `CuentaCorriente-${cliente.nombre}.pdf`,
    })
  }
  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
>
  Exportar PDF
</button>

            <button onClick={onClose} className="text-xl font-bold">✕</button>
          </div>
        </div>

        {/* RESUMEN */}
        <div className="grid grid-cols-3 gap-3 p-4 border-b border-gray-700">
          <Resumen label="Total" value={cliente.total} />
          <Resumen label="Pagado" value={cliente.pagado} />
          <Resumen label="Saldo" value={cliente.saldo} saldo />
        </div>

        {/* MOVIMIENTOS */}
        <div className="flex-1 overflow-y-auto p-4">
          <CuentaCorrienteMovimientos movimientos={movimientos} />
        </div>
<div className="hidden">
  <div id="cc-pdf">
    <CuentaCorrientePDF cliente={cliente} movimientos={movimientos} />
  </div>
</div>

        {/* MODAL REGISTRAR PAGO */}
        {showPago && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div className="bg-gray-900 w-full max-w-md p-4 rounded-lg">
              <PagoForm
                cliente={cliente.id}
                onPagoRegistrado={async () => {
                  setShowPago(false);
                  await onPagoRegistrado(); // refresh real
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
      <p className={`text-lg font-bold ${saldo && value > 0 ? "text-red-400" : "text-green-400"}`}>
        {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(Number(value) || 0)}
      </p>
    </div>
  );
}
