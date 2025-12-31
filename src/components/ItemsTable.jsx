

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

    // Seleccionar item de los disponibles
    const seleccionarServicio = (id, tarifaId) => {
        const servicio = itemsDisponibles.find(
            (i) => i.id === Number(tarifaId)
        );
        if (!servicio) return;

        setItemsOrden(
            itemsOrden.map((i) =>
                i.id === id
                    ? {
                          ...i,
                          tipo_item: "servicio",
                          tarifaId: servicio.id,
                          productoId: null,
                          nombre: servicio.servicio,
                          precio_unitario: servicio.precio,
                          subtotal: servicio.precio * i.cantidad,
                      }
                    : i
            )
        );
    };

    //selector prodductos
    const seleccionarProducto = (id, productoId) => {
        const producto = productosDisponibles.find(
            (p) => p.id === Number(productoId)
        );
        if (!producto) return;

        setItemsOrden(
            itemsOrden.map((i) =>
                i.id === id
                    ? {
                          ...i,
                          tipo_item: "producto",
                          productoId: producto.id,
                          tarifaId: null,
                          nombre: producto.nombre,
                          precio_unitario: Number(producto.precio_unitario),
                          subtotal:
                              Number(producto.precio_unitario) * i.cantidad,
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
                        <td className="p-2">
                            <div className="flex gap-2">
                                {/* SERVICIOS */}
                                <select
                                    className="w-full p-1 bg-gray-800 border border-gray-700 rounded"
                                    value={
                                        item.tipo_item === "servicio"
                                            ? item.tarifaId || ""
                                            : ""
                                    }
                                    onChange={(e) =>
                                        seleccionarServicio(
                                            item.id,
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">Servicio</option>
                                    {itemsDisponibles.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.servicio} - ${s.precio}
                                        </option>
                                    ))}
                                </select>

                                {/* PRODUCTOS */}
                                <select
                                    className="w-full p-1 bg-gray-800 border border-gray-700 rounded"
                                    value={
                                        item.tipo_item === "producto"
                                            ? item.productoId || ""
                                            : ""
                                    }
                                    onChange={(e) =>
                                        seleccionarProducto(
                                            item.id,
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">Producto</option>
                                    {productosDisponibles.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.nombre} (${p.precio_unitario})
                                        </option>
                                    ))}
                                </select>
                            </div>
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
