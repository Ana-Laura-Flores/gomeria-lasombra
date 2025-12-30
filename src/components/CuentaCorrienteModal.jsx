import { useMemo } from "react";
import { Link } from "react-router-dom";
import CuentaCorrienteMovimientos from "./CuentaCorrienteMovimientos";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(Number(value) || 0);

export default function CuentaCorrienteModal({ cliente, onClose }) {
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

    const pagos = cliente.pagos.map((p) => ({
      fecha: p.fecha,
      tipo: "PAGO",
      referencia: p.metodo_pago || "Pago",
      debe: 0,
      haber: Number(p.monto),
    }));

    return [...ordenes, ...pagos].sort(
      (a, b) => new Date(a.fecha) - new Date(b.fecha)
    );
  }, [cliente]);

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

    <button onClick={onClose} className="text-xl font-bold">
      ✕
    </button>
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