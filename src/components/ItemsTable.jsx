import React from "react";

export default function ItemsTable({ itemsOrden, setItemsOrden, itemsDisponibles }) {

  // Actualizar item (cantidad, precio, subtotal)
  const actualizarItem = (id, campo, valor) => {
    setItemsOrden(
      itemsOrden.map(item => {
        if (item.id === id) {
          const actualizado = { ...item, [campo]: valor };
          actualizado.subtotal = actualizado.cantidad * actualizado.precio_unitario;
          return actualizado;
        }
        return item;
      })
    );
  };

  // Seleccionar item de los disponibles
  const seleccionarItem = (id, tarifaId) => {
    const itemSeleccionado = itemsDisponibles.find(i => i.id === Number(tarifaId));
    if (!itemSeleccionado) return;

    setItemsOrden(
      itemsOrden.map(i =>
        i.id === id
          ? {
              ...i,
              tarifaId: itemSeleccionado.id,
              servicio: itemSeleccionado.servicio,  // nombre del servicio
              precio_unitario: itemSeleccionado.precio,
              subtotal: itemSeleccionado.precio * i.cantidad,
            }
          : i
      )
    );
  };

  return (
    <table className="w-full text-left border-collapse mb-6">
      <thead>
        <tr className="border-b border-gray-700">
          <th className="p-2">Servicio</th>
          <th className="p-2">Cantidad</th>
          <th className="p-2">Precio</th>
          <th className="p-2">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        {itemsOrden.map(item => (
          <tr key={item.id} className="border-b border-gray-800">
            <td className="p-2">
              <select
                className="w-full p-1 bg-gray-800 border border-gray-700 rounded"
                value={item.tarifaId || ""}
                onChange={e => seleccionarItem(item.id, e.target.value)}
              >
                <option value="">Seleccionar</option>
                {itemsDisponibles.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.servicio} - ${i.precio}
                  </option>
                ))}
              </select>
            </td>
            <td className="p-2">
              <input
                type="number"
                className="w-20 p-1 bg-gray-800 border border-gray-700 rounded"
                value={item.cantidad}
                onChange={e =>
                  actualizarItem(item.id, "cantidad", Number(e.target.value))
                }
              />
            </td>
            <td className="p-2">$ {item.precio_unitario}</td>
            <td className="p-2">$ {item.subtotal}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
