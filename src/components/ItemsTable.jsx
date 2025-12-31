import React from "react";

export default function ItemsTable({ itemsOrden, setItemsOrden, itemsDisponibles }) {
  const actualizarItem = (filaId, campo, valor) => {
    setItemsOrden(
      itemsOrden.map(item => {
        if (item.filaId === filaId) {
          const actualizado = { ...item, [campo]: valor };
          actualizado.subtotal = actualizado.cantidad * actualizado.precio_unitario;
          return actualizado;
        }
        return item;
      })
    );
  };

  const seleccionarItem = (filaId, itemId) => {
    const itemSeleccionado = itemsDisponibles.find(i => Number(i.id) === Number(itemId));
    if (!itemSeleccionado) return;

    setItemsOrden(
      itemsOrden.map(item =>
        item.filaId === filaId
          ? {
              ...item,
              itemId: itemSeleccionado.id,
              nombre: itemSeleccionado.nombre || itemSeleccionado.servicio?.nombre,
              tipo_item: itemSeleccionado.servicio ? "Servicio" : "Producto",
              precio_unitario: itemSeleccionado.precio || itemSeleccionado.precio_unitario,
              subtotal: item.cantidad * (itemSeleccionado.precio || itemSeleccionado.precio_unitario),
            }
          : item
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
          <tr key={item.filaId} className="border-b border-gray-800">
            <td className="p-2">
              <select
                className="w-full p-1 bg-gray-800 border border-gray-700 rounded"
                value={item.itemId || ""}
                onChange={e => seleccionarItem(item.filaId, e.target.value)}
              >
                <option value="">Seleccionar</option>
                {itemsDisponibles.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.nombre || i.servicio?.nombre} - ${i.precio || i.precio_unitario}
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
                  actualizarItem(item.filaId, "cantidad", Number(e.target.value))
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
