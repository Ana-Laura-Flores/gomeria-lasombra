import { useState } from "react";
import PagosTable from "../components/pagos/PagosTable";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(Number(value) || 0);

export default function CuentaCorrienteModal({ cliente, onClose }) {
  const [ordenAbierta, setOrdenAbierta] = useState(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Cuenta Corriente · {cliente.nombre}
          </h2>
          <button onClick={onClose} className="text-white font-bold">
            ✕
          </button>
        </div>

        {/* RESUMEN CLIENTE */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Resumen label="Total" value={cliente.total} />
          <Resumen label="Pagado" value={cliente.pagado} />
          <Resumen label="Saldo" value={cliente.saldo} saldo />
        </div>

        {/* ÓRDENES */}
        <table className="min-w-full bg-gray-800 text-gray-100 rounded-lg">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-2 text-left">Orden</th>
              <th className="p-2 text-right">Total</th>
              <th className="p-2 text-right">Pagado</th>
              <th className="p-2 text-right">Saldo</th>
              <th className="p-2 text-center">Pagos</th>
            </tr>
          </thead>

          <tbody>
            {cliente.ordenes.map((o) => (
              <>
                <tr
                  key={o.id}
                  className="border-b border-gray-700 hover:bg-gray-700"
                >
                  <td className="p-2">
                    #{o.comprobante || o.id}
                  </td>
                  <td className="p-2 text-right">
                    {formatMoney(o.total)}
                  </td>
                  <td className="p-2 text-right">
                    {formatMoney(o.total_pagado)}
                  </td>
                  <td className="p-2 text-right">
                    {formatMoney(o.saldo)}
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() =>
                        setOrdenAbierta(
                          ordenAbierta?.id === o.id ? null : o
                        )
                      }
                      className="text-blue-400 hover:underline"
                    >
                      {ordenAbierta?.id === o.id
                        ? "Ocultar"
                        : "Ver"}
                    </button>
                  </td>
                </tr>

                {/* DETALLE DE PAGOS */}
                {ordenAbierta?.id === o.id && (
                  <tr className="bg-gray-850">
                    <td colSpan={5} className="p-4">
                      <PagosTable
                        pagos={o.pagos || []}
                        totalPagado={o.total_pagado}
                        saldo={o.saldo}
                      />
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Resumen({ label, value, saldo }) {
  return (
    <div className="bg-gray-800 p-3 rounded">
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
