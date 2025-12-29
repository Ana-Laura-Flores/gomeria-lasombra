import { useState, useMemo } from "react";
import PagosTable from "../components/pagos/PagosTable";
import { Link } from "react-router-dom";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(Number(value) || 0);
  


export default function CuentaCorrienteModal({ cliente, onClose }) {
  const [ordenAbierta, setOrdenAbierta] = useState(null);
  const movimientos = useMemo(() => {
  const ordenes = cliente.ordenes.map(o => ({
    fecha: o.fecha,
    tipo: "ORDEN",
    referencia: o.comprobante || o.id,
    debe: Number(o.total),
    haber: 0,
  }));

  const pagos = cliente.pagos.map(p => ({
    fecha: p.fecha,
    tipo: "PAGO",
    referencia: p.orden?.comprobante || "-",
    debe: 0,
    haber: Number(p.monto),
  }));

  return [...ordenes, ...pagos].sort(
    (a, b) => new Date(a.fecha) - new Date(b.fecha)
  );
}, [cliente]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center md:justify-center">
      <div
        className="
          bg-gray-900 w-full h-[100dvh]
          md:h-auto md:max-w-3xl md:rounded-lg
          flex flex-col
        "
      >
        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">
            Cuenta corriente · {cliente.nombre}
          </h2>
          <button onClick={onClose} className="text-xl font-bold">
            ✕
          </button>
        </div>

        {/* ================= RESUMEN ================= */}
        <div className="grid grid-cols-3 gap-3 p-4 border-b border-gray-700">
          <Resumen label="Total" value={cliente.total} />
          <Resumen label="Pagado" value={cliente.pagado} />
          <Resumen label="Saldo" value={cliente.saldo} saldo />
        </div>

        {/* ================= CONTENIDO CON SCROLL ================= */}
        <div className="flex-1 overflow-y-auto p-4">

          <table className="min-w-full bg-gray-800 text-gray-100 rounded-lg">
            <thead className="bg-gray-700 sticky top-0 z-10">
              <tr>
                <th className="p-2 text-left">Orden</th>
                <th className="p-2 text-right">Total</th>
                <th className="p-2 text-right">Pagado</th>
                <th className="p-2 text-right">Saldo</th>
                <th className="p-2 text-center">Pagos</th>
              </tr>
            </thead>
<div className="flex-1 overflow-y-auto p-4 space-y-6">

  <CuentaCorrienteMovimientos movimientos={movimientos} />

  <table className="min-w-full bg-gray-800 text-gray-100 rounded-lg">
    ...
  </table>

</div>

            <tbody>
              {cliente.ordenes.map((o) => (
                <FragmentOrden
                  key={o.id}
                  orden={o}
                  abierta={ordenAbierta}
                  setOrdenAbierta={setOrdenAbierta}
                />
              ))}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}

/* ================= SUBCOMPONENTES ================= */

function FragmentOrden({ orden, abierta, setOrdenAbierta }) {
  const abiertaEsta = abierta?.id === orden.id;

  return (
    <>
      <tr className="border-b border-gray-700 hover:bg-gray-700">
    <td className="p-2">
  <Link
    to={`/ordenes/${orden.id}`}
    className="text-blue-400 hover:underline"
  >
    #{orden.comprobante || orden.id}
  </Link>
</td>

        <td className="p-2 text-right">{formatMoney(orden.total)}</td>
        <td className="p-2 text-right">{formatMoney(orden.total_pagado)}</td>
        <td className="p-2 text-right">{formatMoney(orden.saldo)}</td>
        <td className="p-2 text-center">
          <button
            onClick={() =>
              setOrdenAbierta(abiertaEsta ? null : orden)
            }
            className="text-blue-400 hover:underline"
          >
            {abiertaEsta ? "Ocultar" : "Ver"}
          </button>
        </td>
      </tr>

      {/* ===== DETALLE DE PAGOS ===== */}
      {abiertaEsta && (
        <tr className="bg-gray-850">
          <td colSpan={5} className="p-3">
            <div className="max-h-[40vh] overflow-y-auto rounded-lg">
              <PagosTable
                pagos={orden.pagos || []}
                totalPagado={orden.total_pagado}
                saldo={orden.saldo}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function Resumen({ label, value, saldo }) {
  return (
    <div className="bg-gray-800 p-3 rounded text-center">
      <span className="text-gray-400 text-sm">{label}</span>
      <p
        className={`text-lg font-bold ${
          saldo && value > 0 ? "text-red-400" : ""
        }`}
      >
        {formatMoney(value)}
      </p>
    </div>
  );
}
