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
  const seleccionarItem = (id, itemId) => {
    const itemSeleccionado = itemsDisponibles.find(i => i.id === Number(itemId));
    if (!itemSeleccionado) return;

    setItemsOrden(
      itemsOrden.map(i =>
        i.id === id
          ? {
              ...i,
              itemId: itemSeleccionado.id, // ID único para select
              nombre: itemSeleccionado.servicio || itemSeleccionado.nombre,
              tipo_item: itemSeleccionado.servicio ? "Servicio" : "Producto",
              precio_unitario: itemSeleccionado.precio || itemSeleccionado.precio_unitario,
              subtotal: (itemSeleccionado.precio || itemSeleccionado.precio_unitario) * i.cantidad,
            }
          : i
      )
    );
  };

  return (
    <table className="w-full text-left border-collapse mb-6">
      <thead>
        <tr className="border-b border-gray-700">
          <th className="p-2">Ítem</th>
          <th className="p-2">Tipo</th>
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
                value={item.itemId || ""}
                onChange={e => seleccionarItem(item.id, e.target.value)}
              >
                <option value="">Seleccionar</option>
                {itemsDisponibles.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.servicio || i.nombre} - ${i.precio || i.precio_unitario}
                  </option>
                ))}
              </select>
            </td>
            <td className="p-2">{item.tipo_item || "-"}</td>
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
