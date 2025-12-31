export default function ItemsTable({
    itemsOrden,
    setItemsOrden,
    itemsDisponibles,
    productosDisponibles,
}) {
    // Actualizar item (cantidad, precio, subtotal)
    const actualizarItem = (id, campo, valor) => {
        setItemsOrden(
            itemsOrden.map((item) => {
                if (item.id === id) {
                    const actualizado = { ...item, [campo]: valor };
                    actualizado.subtotal =
                        actualizado.cantidad * actualizado.precio_unitario;
                    return actualizado;
                }
                return item;
            })
        );
    };

   const cambiarTipoItem = (id, tipo) => {
  setItemsOrden(
    itemsOrden.map((item) =>
      item.id === id
        ? {
            ...item,
            tipo_item: tipo,
            servicio_id: null,
            producto_id: null,
            precio_unitario: 0,
            subtotal: 0,
          }
        : item
    )
  );
};


    // Seleccionar item de los disponibles
  const seleccionarServicio = (id, tarifaId) => {
  const tarifa = itemsDisponibles.find((i) => i.id === Number(tarifaId));
  if (!tarifa) return;

  setItemsOrden(
    itemsOrden.map((i) =>
      i.id === id
        ? {
            ...i,
            tipo_item: "servicio",
            tarifa: tarifa.id,        // ⚡ id correcto
            producto: null,
            nombre: tarifa.nombre,    // ⚡ guardar el nombre
            precio_unitario: tarifa.precio,
            subtotal: tarifa.precio * i.cantidad,
          }
        : i
    )
  );
};



    //selector prodductos
  const seleccionarProducto = (id, productoId) => {
  const prod = productosDisponibles.find((p) => p.id === Number(productoId));
  if (!prod) return;

  setItemsOrden(
    itemsOrden.map((i) =>
      i.id === id
        ? {
            ...i,
            tipo_item: "producto",
            producto: prod.id,      // ⚡ id correcto
            tarifa: null,
            nombre: prod.nombre,    // ⚡ guardar el nombre
            precio_unitario: Number(prod.precio_unitario),
            subtotal: Number(prod.precio_unitario) * i.cantidad,
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
                    <th className="p-2">Cantidad</th>
                    <th className="p-2">Precio</th>
                    <th className="p-2">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                {itemsOrden.map((item) => (
                    <tr key={item.id} className="border-b border-gray-800">
                        <td className="p-2 space-y-1">
                            {/* Tipo */}
                            <select
                                className="w-full p-1 bg-gray-800 border border-gray-700 rounded"
                                value={item.tipo_item}
                                onChange={(e) =>
                                    cambiarTipoItem(item.id, e.target.value)
                                }
                            >
                                <option value="servicio">Servicio</option>
                                <option value="producto">Producto</option>
                            </select>

                            {/* Select dinámico */}
                            {item.tipo_item === "servicio" ? (
                              <select
  className="w-full p-1 bg-gray-800 border border-gray-700 rounded"
  value={item.tarifa || ""} // ⚡ usar tarifa, no tarifa_id
  onChange={(e) =>
    seleccionarServicio(item.id, e.target.value)
  }
>
  <option value="">Seleccionar servicio</option>
  {itemsDisponibles.map((s) => (
    <option key={s.id} value={s.id}>
      {s.servicio} - ${s.precio}
    </option>
  ))}
</select>

                            ) : (
                              <select
  className="w-full p-1 bg-gray-800 border border-gray-700 rounded"
  value={item.producto || ""} // ⚡ usar producto, no producto_id
  onChange={(e) =>
    seleccionarProducto(item.id, e.target.value)
  }
>
  <option value="">Seleccionar producto</option>
  {productosDisponibles.map((p) => (
    <option key={p.id} value={p.id}>
      {p.nombre} - ${p.precio_unitario}
    </option>
  ))}
</select>

                            )}
                        </td>

                        <td className="p-2">
                            <input
                                type="number"
                                className="w-20 p-1 bg-gray-800 border border-gray-700 rounded"
                                value={item.cantidad}
                                onChange={(e) =>
                                    actualizarItem(
                                        item.id,
                                        "cantidad",
                                        Number(e.target.value)
                                    )
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
