const formatMoney = (value) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(Number(value) || 0);

export default function CuentaCorrienteModal({ cliente, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Órdenes de {cliente.nombre}</h2>
          <button onClick={onClose} className="text-white font-bold">X</button>
        </div>
        <table className="min-w-full bg-gray-800 text-gray-100 rounded-lg">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2 text-right">Total</th>
              <th className="p-2 text-right">Pagado</th>
              <th className="p-2 text-right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {cliente.ordenes.map(o => (
              <tr key={o.id} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="p-2">{o.id}</td>
                <td className="p-2 text-right">{formatMoney(o.total)}</td>
                <td className="p-2 text-right">{formatMoney(o.total_pagado)}</td>
                <td className="p-2 text-right">{formatMoney(o.saldo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
