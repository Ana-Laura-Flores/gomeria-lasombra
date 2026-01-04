import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CuentaCorrienteMovimientos from "./CuentaCorrienteMovimientos";
import PagoForm from "./pagos/PagoForm";
import { exportarPDFOrden } from "../utils/exportarPDFOrden";
import CuentaCorrientePDF from "./CuentaCorrientePDF";

export default function CuentaCorrienteModal({
  clienteId,
  clientesCC,
  onClose,
  onPagoRegistrado, // función opcional para refrescar lista externa
}) {
  const [showPago, setShowPago] = useState(false);
  const [pagosExtra, setPagosExtra] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
  return () => {
    setPagosExtra([]);
    setShowPago(false);
    setShowSuccess(false);
  };
}, []);


  const cliente = useMemo(
    () => clientesCC.find((c) => c.id === clienteId),
    [clientesCC, clienteId]
  );
  if (!cliente) return null;

  // Movimientos combinados: órdenes + pagos
  const movimientos = useMemo(() => {
    const ordenes = cliente.ordenes.map((o) => ({
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

  const resumen = useMemo(() => {
    const total = cliente.total;
    const pagado =
      cliente.pagado +
      pagosExtra.reduce((acc, p) => acc + Number(p.monto), 0);
    const saldo = total - pagado;
    return { total, pagado, saldo };
  }, [cliente, pagosExtra]);

  // ===========================
  // Manejo de pago registrado
  // ===========================
  const handlePagoRegistrado = (pagosNuevos) => {
    // Agregamos pagos a la lista local
    setPagosExtra((prev) => [...prev, ...pagosNuevos]);

    // Cerramos modal de pago y abrimos modal de éxito
    setShowPago(false);
    setShowSuccess(true);

    // Refrescar lista general si existe la función
   onPagoRegistrado?.();
  };

  const handleSuccessAction = (accion) => {
    setShowSuccess(false);
    
    switch (accion) {
      case "detalle":
        navigate(`/cuentas/${clienteId}`);
        break;
      case "ordenes":
        navigate(`/ordenes`);
        break;
      case "listado":
        navigate(`/cuenta-corriente`);
        break;
      default:
        onClose?.();
    }
  };

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
            <button onClick={onClose} className="text-xl font-bold">
              ✕
            </button>
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
            <CuentaCorrientePDF
              cliente={{ id: clienteId, nombre: cliente.nombre, ...resumen }}
              movimientos={movimientos}
            />
          </div>
        </div>

        {/* MODAL PAGOS */}
        {showPago && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div className="bg-gray-900 w-full max-w-md p-4 rounded-lg">
              <PagoForm
                cliente={cliente.id}
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
              <h2 className="text-lg font-bold mb-2">
                Pago registrado correctamente
              </h2>
              <p>¿Qué querés hacer ahora?</p>
              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={() => handleSuccessAction("detalle")}
                  className="bg-blue-600 text-white py-2 rounded"
                >
                  Ver cuenta corriente del cliente
                </button>
                <button
                  onClick={() => handleSuccessAction("ordenes")}
                  className="bg-gray-600 text-white py-2 rounded"
                >
                  Volver a órdenes
                </button>
                <button
                  onClick={() => handleSuccessAction("listado")}
                  className="bg-green-600 text-white py-2 rounded"
                >
                  Volver al listado de cuentas corrientes
                </button>
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
