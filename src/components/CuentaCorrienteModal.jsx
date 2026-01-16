import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PagoForm from "./pagos/PagoForm";
import CuentaCorrienteMovimientos from "./CuentaCorrienteMovimientos";
import CuentaCorrientePDF from "./CuentaCorrientePDF";
import { exportarPDFOrden } from "../utils/exportarPDFOrden";
import { getOrdenesTrabajo, getPagosCliente, crearAnulacion } from "../services/api";
import ReciboPagoPDF from "../components/ReciboPagoPdf";


export default function CuentaCorrienteModal({ clienteId, onClose, onPagoRegistrado }) {
  const [cliente, setCliente] = useState(null);
  const [ordenes, setOrdenes] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPago, setShowPago] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAnulacionSuccess, setShowAnulacionSuccess] = useState(false);
  const [pagoRecibo, setPagoRecibo] = useState(null);
  const [showRecibo, setShowRecibo] = useState(false);
  const [showAnulacionModal, setShowAnulacionModal] = useState(false);
  const [pagoAAnular, setPagoAAnular] = useState(null);
  const [motivoAnulacion, setMotivoAnulacion] = useState("");
  const navigate = useNavigate();

 useEffect(() => {
  if (!clienteId) return;

  const fetchData = async () => {
  setLoading(true);
  const t = Date.now();
  try {
    const idBuscado = String(clienteId?.id || clienteId);
    
    const [resOrdenes, resPagos] = await Promise.all([
      getOrdenesTrabajo(),
      getPagosCliente(idBuscado), 
    ]);

    // FILTRO MANUAL DE ÓRDENES
    const ordenesFiltradas = (resOrdenes.data || []).filter(o => 
      String(o.cliente?.id || o.cliente) === idBuscado &&
      o.condicion_cobro === "cuenta_corriente"
    );

    // FILTRO MANUAL DE PAGOS (Aquí está la clave)
    const pagosFiltrados = (resPagos.data || []).filter(p => 
      String(p.cliente?.id || p.cliente) === idBuscado &&
      p.estado === "confirmado"
    );

    console.log("Pagos encontrados para este cliente:", pagosFiltrados.length);

    setOrdenes(ordenesFiltradas);
    setPagos(pagosFiltrados);

    // Seteamos el cliente con los datos que ya tenemos
    if (ordenesFiltradas.length > 0) {
      setCliente(ordenesFiltradas[0].cliente);
    }
  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false);
  }
};

  fetchData();
}, [clienteId]);


  // --- Movimientos ---
const movimientos = useMemo(() => {
  const movOrdenes = ordenes.map(o => ({
    fecha: o.fecha,
    tipo: "ORDEN",
    referencia: <Link to={`/ordenes/${o.id}`} className="text-blue-400 hover:underline">#{o.comprobante || o.id}</Link>,
    debe: Number(o.total),
    haber: 0,
  }));

  const movPagos = pagos.map(p => {
  const esAnulacion = p.tipo === "anulacion";

  return {
    fecha: p.fecha || new Date().toISOString().split("T")[0],

    tipo: esAnulacion
      ? "ANULACIÓN"
      : p.metodo_pago === "cheque"
        ? "CHEQUE"
        : "PAGO",

    referencia: `Recibo #${p.numero_recibo || "—"}`,

    // 🔴 CLAVE CONTABLE
    debe: esAnulacion ? Number(p.monto) : 0,
    haber: esAnulacion ? 0 : Number(p.monto),

    // Datos del cheque (no afectan el saldo)
    banco: p.banco || null,
    numero_cheque: p.numero_cheque || null,
    fecha_cobro: p.fecha_cobro || null,

    pago: p,
  };
});


  return [...movOrdenes, ...movPagos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
}, [ordenes, pagos]);

// --- Resumen ---
const resumen = useMemo(() => {
  const total = ordenes.reduce((a, o) => a + Number(o.total), 0);
  let saldo = total;
  pagos.forEach(p => {
    if (p.tipo === "anulacion") saldo += Number(p.monto); // anulación suma
    else saldo -= Number(p.monto); // pago resta
  });
  const pagado = total - saldo;
  return { total, pagado, saldo };
}, [ordenes, pagos]);


// --- Pago registrado ---
  const handlePagoRegistrado = (pagosNuevos) => {
    // 1. Actualiza la lista interna del modal
    setPagos((prev) => [...prev, ...pagosNuevos]);
    
    // 💡 2. AVISA a la tabla general que hay nuevos pagos
    if (onPagoRegistrado) {
      onPagoRegistrado(pagosNuevos);
    }
    
    setShowPago(false);
    setShowSuccess(true);
  };
  const abrirModalAnulacion = (pago) => {
  setPagoAAnular(pago);
  setMotivoAnulacion("");
  setShowAnulacionModal(true);
};

  const confirmarAnulacion = async () => {
    if (!motivoAnulacion.trim()) return;
    try {
      const nuevaAnulacion = await crearAnulacion(pagoAAnular, motivoAnulacion);
      
      // 1. Actualiza la lista interna del modal
      setPagos(prev => [...prev, nuevaAnulacion]);

      // 💡 2. AVISA a la tabla general que hay una anulación
      if (onPagoRegistrado) {
        onPagoRegistrado([nuevaAnulacion]); // Envuelto en array para consistencia
      }

      setShowAnulacionModal(false);
      setShowAnulacionSuccess(true);
    } catch (err) {
      console.error("Error al anular el pago:", err);
    }
  };
  
if (loading) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center text-white font-bold">
      Cargando cuenta corriente...
    </div>
  );
}

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
          <CuentaCorrienteMovimientos
            movimientos={movimientos}
            onVerRecibo={(pago) => {
              setPagoRecibo(pago);
              setShowRecibo(true);
            }}
            onAnularPago={abrirModalAnulacion}
          />
        </div>

        {/* PDF OCULTO */}
        <div className="hidden">
          <div id="cc-pdf">
            <CuentaCorrientePDF cliente={{ ...cliente, ...resumen }} movimientos={movimientos} />
          </div>
          {pagoRecibo && (
            <div id="recibo-pdf">
              <ReciboPagoPDF pago={pagoRecibo} cliente={cliente} orden={pagoRecibo.orden || {}} />
            </div>
          )}
        </div>

        {/* MODAL PAGO */}
        {showPago && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div className="bg-gray-900 w-full max-w-md p-4 rounded-lg">
              <PagoForm cliente={cliente.id} pagosExistentes={pagos} onPagoRegistrado={handlePagoRegistrado} />
              <button onClick={() => setShowPago(false)} className="mt-3 w-full bg-gray-700 py-2 rounded">Cancelar</button>
            </div>
          </div>
        )}

        {/* MODAL SUCCESS PAGO */}
        {showSuccess && (
          <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center">
            <div className="bg-gray-900 p-6 rounded-lg w-80 text-center space-y-4">
              <h2 className="text-lg font-bold">Pago creado exitosamente</h2>
              <button onClick={() => exportarPDFOrden({ elementId: "cc-pdf", filename: `CuentaCorriente-${cliente.nombre}.pdf` })} className="bg-blue-600 py-2 rounded w-full">Descargar PDF</button>
              <button onClick={() => setShowSuccess(false)} className="bg-green-600 py-2 rounded w-full">Aceptar</button>
            </div>
          </div>
        )}

        {/* MODAL SUCCESS ANULACION */}
        {showAnulacionSuccess && (
          <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center">
            <div className="bg-gray-900 p-6 rounded-lg w-80 text-center space-y-4">
              <h2 className="text-lg font-bold text-red-400">Pago anulado exitosamente</h2>
              <button onClick={() => setShowAnulacionSuccess(false)} className="bg-green-600 py-2 rounded w-full">Aceptar</button>
            </div>
          </div>
        )}

        {/* MODAL RECIBO */}
        {showRecibo && pagoRecibo && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div className="bg-gray-900 p-6 rounded-lg w-96 space-y-3">
              <h2 className="text-lg font-bold">Recibo #{pagoRecibo.numero_recibo}</h2>
              <div className="text-sm space-y-1">
                <p><b>Fecha:</b> {new Date(pagoRecibo.fecha).toLocaleDateString("es-AR")}</p>
                <p><b>Monto:</b> ${pagoRecibo.monto}</p>
                <p><b>Método:</b> {pagoRecibo.metodo_pago}</p>
                {pagoRecibo.banco && <p><b>Banco:</b> {pagoRecibo.banco}</p>}
                {pagoRecibo.numero_cheque && <p><b>Cheque Nº:</b> {pagoRecibo.numero_cheque}</p>}
              </div>
              <div className="flex gap-2 pt-4">
                <button onClick={() => exportarPDFOrden({ elementId: "recibo-pdf", filename: `Recibo-${pagoRecibo.numero_recibo}.pdf` })} className="bg-blue-600 px-4 py-2 rounded w-full">Descargar PDF</button>
                <button onClick={() => setShowRecibo(false)} className="bg-gray-700 px-4 py-2 rounded w-full">Cerrar</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ANULACION */}
        {showAnulacionModal && pagoAAnular && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div className="bg-gray-900 p-4 rounded w-96 space-y-4">
              <h2 className="text-lg font-bold">Anular pago #{pagoAAnular.numero_recibo}</h2>
              <textarea rows={3} value={motivoAnulacion} onChange={(e) => setMotivoAnulacion(e.target.value)} className="w-full p-2 bg-gray-800 text-white rounded" placeholder="Ingresá el motivo de anulación" />
              <div className="flex gap-2">
                <button onClick={confirmarAnulacion} className="bg-red-600 px-4 py-2 rounded text-white w-1/2 hover:bg-red-700">Confirmar</button>
                <button onClick={() => setShowAnulacionModal(false)} className="bg-gray-700 px-4 py-2 rounded w-1/2 hover:bg-gray-600">Cancelar</button>
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
