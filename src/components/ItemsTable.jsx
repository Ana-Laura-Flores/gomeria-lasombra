import React from "react";

export default function ItemsTable({ itemsOrden, setItemsOrden, itemsDisponibles }) {
  const actualizarItem = (id, campo, valor) => {
    setItemsOrden(itemsOrden.map(i =>
      i.id === id ? { ...i, [campo]: valor } : i
    ));
  };

  return (
    <table className="w-full border-collapse border border-gray-700">
      <thead>
        <tr>
          <th className="border border-gray-700 p-2">Tipo</th>
          <th className="border border-gray-700 p-2">Servicio</th>
          <th className="border border-gray-700 p-2">Cantidad</th>
          <th className="border border-gray-700 p-2">Precio</th>
          <th className="border border-gray-700 p-2">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        {itemsOrden.map(item => (
          <tr key={item.id}>
            {/* Selector servicio/producto */}
            <td className="border border-gray-700 p-2">
              <select
                value={item.tipo_item}
                onChange={e => actualizarItem(item.id, "tipo_item", e.target.value)}
              >
                <option value="servicio">Servicio</option>
                <option value="producto">Producto</option>
              </select>
            </td>

            {/* Servicio */}
            <td className="border border-gray-700 p-2">
              <select
                value={item.servicio}
                onChange={e => actualizarItem(item.id, "servicio", e.target.value)}
              >
                <option value="">Seleccionar</option>
                {itemsDisponibles.map(opt => (
                  <option key={opt.id} value={opt.servicio}>
                    {opt.servicio}
                  </option>
                ))}
              </select>
            </td>

            {/* Cantidad */}
            <td className="border border-gray-700 p-2">
              <input
                type="number"
                min="1"
                value={item.cantidad}
                onChange={e => {
                  const cantidad = Number(e.target.value);
                  const subtotal = cantidad * item.precio_unitario;
                  actualizarItem(item.id, "cantidad", cantidad);
                  actualizarItem(item.id, "subtotal", subtotal);
                }}
                className="w-20 p-1 rounded bg-gray-800 border border-gray-700"
              />
            </td>

            {/* Precio */}
            <td className="border border-gray-700 p-2">
              <input
                type="number"
                value={item.precio_unitario}
                onChange={e => {
                  const precio = Number(e.target.value);
                  const subtotal = precio * item.cantidad;
                  actualizarItem(item.id, "precio_unitario", precio);
                  actualizarItem(item.id, "subtotal", subtotal);
                }}
                className="w-24 p-1 rounded bg-gray-800 border border-gray-700"
              />
            </td>

            {/* Subtotal */}
            <td className="border border-gray-700 p-2">
              ${item.subtotal.toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}