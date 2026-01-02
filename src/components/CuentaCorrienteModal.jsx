import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CuentaCorrienteMovimientos from "./CuentaCorrienteMovimientos";
import PagoForm from "./pagos/PagoForm";
import { exportarPDFOrden } from "../utils/exportarPDFOrden";
import CuentaCorrientePDF from "./CuentaCorrientePDF";

export default function CuentaCorrienteModal({
  clienteId,
  clientesCC,
  onClose,
  onPagoRegistrado,
}) {
  const [showPago, setShowPago] = useState(false);
  const [pagosExtra, setPagosExtra] = useState([]); // 🔹 nuevos pagos que se agregan al vuelo

  const [showSuccess, setShowSuccess] = useState(false);

const handlePagoRegistrado = (pagosNuevos) => {
  setPagosExtra((prev) => [...prev, ...pagosNuevos]);
  
  // Cerrar modal de pago primero
  setShowPago(false);

  // Abrir modal de éxito en el siguiente render
  setTimeout(() => {
    setShowSuccess(true);
  }, 0);

  onPagoRegistrado?.(); // refresca datos padre
};


  // Cliente recalculado desde lista actualizada
  const cliente = useMemo(() => {
    return clientesCC.find((c) => c.id === clienteId);
  }, [clientesCC, clienteId]);

  if (!cliente) return null;

  // Movimientos combinando órdenes y pagos (incluye pagos extra)
  const movimientos = useMemo(() => {
    const ordenes = cliente.ordenes.map((o) => ({
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

    const pagos = [...cliente.pagos, ...pagosExtra].map((p) => ({
      fecha: p.fecha || new Date().toISOString().split("T")[0],
      tipo: p.metodo_pago === "cheque" ? "CHEQUE" : "PAGO",
      referencia: p.metodo_pago || "Pago",
      debe: 0,
      haber: Number(p.monto),
      banco: p.banco || null,
      numero_cheque: p.numero_cheque || null,
      fecha_cobro: p.fecha_cobro || null,
    }));

    return [...ordenes, ...pagos].sort(
      (a, b) => new Date(a.fecha) - new Date(b.fecha)
    );
  }, [cliente, pagosExtra]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center md:justify-center">
      <div className="bg-gray-900 w-full h-[100dvh] md:h-auto md:max-w-3xl md:rounded-lg flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">
            Cuenta corriente · {cliente.nombre}
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
                  filename: `CuentaCorriente-${cliente.nombre}.pdf`,
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
          <Resumen label="Total" value={cliente.total} />
          <Resumen label="Pagado" value={cliente.pagado + pagosExtra.reduce((acc, p) => acc + Number(p.monto), 0)} />
          <Resumen label="Saldo" value={cliente.total - cliente.pagado - pagosExtra.reduce((acc, p) => acc + Number(p.monto), 0)} saldo />
        </div>

        {/* MOVIMIENTOS */}
        <div className="flex-1 overflow-y-auto p-4">
          <CuentaCorrienteMovimientos movimientos={movimientos} />
        </div>

        {/* PDF OCULTO */}
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
        onPagoRegistrado={handlePagoRegistrado} // ✅ aquí usamos la función correcta
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

{/* MODAL ÉXITO */}
{showSuccess && (
  <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
    <div className="bg-gray-900 p-6 rounded-lg w-80 text-center space-y-4">
      <h2 className="text-lg font-bold mb-2">Pago registrado correctamente</h2>
      <p>¿Querés ver la cuenta corriente del cliente o volver a órdenes?</p>
      <div className="flex flex-col gap-2 mt-2">
        <button
          onClick={() => {
            setShowSuccess(false);
            onClose(); // cerramos el modal principal si querés
          }}
          className="bg-blue-600 text-white py-2 rounded"
        >
          Ver cuenta corriente
        </button>
        <button
          onClick={() => {
            setShowSuccess(false);
            onClose();
          }}
          className="bg-gray-600 text-white py-2 rounded"
        >
          Volver a órdenes
        </button>
      </div>
    </div>
  </div>
)}


      </div>
    </div>
  );
}

// --------------------
// SUBCOMPONENTE RESUMEN
// --------------------
function Resumen({ label, value, saldo }) {
  return (
    <div className="bg-gray-800 p-3 rounded text-center">
      <span className="text-gray-400 text-sm">{label}</span>
      <p
        className={`text-lg font-bold ${
          saldo && value > 0 ? "text-red-400" : "text-green-400"
        }`}
      >
        {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(Number(value) || 0)}
      </p>
    </div>
  );
}
