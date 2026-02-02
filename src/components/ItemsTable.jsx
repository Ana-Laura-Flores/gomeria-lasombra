export default function ItemsTable({
    itemsOrden,
    setItemsOrden,
    itemsDisponibles,
    productosDisponibles,
}) {
    // ID único del servicio de saldo anterior
    const ID_SALDO_ANTERIOR = "c388153e-9f9c-48ad-92d9-a510114d85ab";

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
                          tarifa: null, // Resetear tarifa
                          producto: null, // Resetear producto
                          precio_unitario: 0,
                          subtotal: 0,
                          nombre: "",
                      }
                    : item
            )
        );
    };

    const seleccionarServicio = (id, tarifaId) => {
        const tarifa = itemsDisponibles.find((i) => i.id === tarifaId || i.id === Number(tarifaId));
        if (!tarifa) return;

        setItemsOrden(
            itemsOrden.map((i) =>
                i.id === id
                    ? {
                          ...i,
                          tipo_item: "servicio",
                          tarifa: tarifa.id,
                          producto: null,
                          nombre: tarifa.servicio || tarifa.nombre,
                          precio_unitario: Number(tarifa.precio) || 0,
                          subtotal: (Number(tarifa.precio) || 0) * i.cantidad,
                      }
                    : i
            )
        );
    };

    const seleccionarProducto = (id, productoId) => {
        const prod = productosDisponibles.find(
            (p) => p.id === Number(productoId)
        );
        if (!prod) return;

        setItemsOrden(
            itemsOrden.map((i) =>
                i.id === id
                    ? {
                          ...i,
                          tipo_item: "producto",
                          producto: prod.id,
                          tarifa: null,
                          nombre: prod.nombre,
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
                <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
                    <th className="p-2">Ítem / Tipo</th>
                    <th className="p-2">Cantidad</th>
                    <th className="p-2">Precio Unitario</th>
                    <th className="p-2 text-right">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                {itemsOrden.map((item) => {
                    // Verificamos si este item es el "Saldo anterior"
                  const esSaldoAnterior = item.tarifa == ID_SALDO_ANTERIOR || item.tarifa_id == ID_SALDO_ANTERIOR;

                    return (
                        <tr key={item.id} className="border-b border-gray-800">
                            <td className="p-2 space-y-2 w-1/2">
                                <select
                                    className="w-full p-1 bg-gray-900 border border-gray-700 rounded text-sm text-white"
                                    value={item.tipo_item}
                                    onChange={(e) => cambiarTipoItem(item.id, e.target.value)}
                                >
                                    <option value="servicio">Servicio</option>
                                    <option value="producto">Producto</option>
                                </select>

                                {item.tipo_item === "servicio" ? (
                                    <select
                                        className="w-full p-1 bg-gray-800 border border-gray-700 rounded text-sm text-white"
                                        value={item.tarifa || ""}
                                        onChange={(e) => seleccionarServicio(item.id, e.target.value)}
                                    >
                                        <option value="">Seleccionar servicio</option>
                                        {itemsDisponibles.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.servicio} {s.precio > 0 ? `- $${s.precio}` : ""}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <select
                                        className="w-full p-1 bg-gray-800 border border-gray-700 rounded text-sm text-white"
                                        value={item.producto || ""}
                                        onChange={(e) => seleccionarProducto(item.id, e.target.value)}
                                    >
                                        <option value="">Seleccionar producto</option>
                                        {productosDisponibles.map((p) => (
                                            <option key={p.id} value={p.id}>{p.nombre}</option>
                                        ))}
                                    </select>
                                )}
                            </td>

                            <td className="p-2">
                                <input
                                    type="number"
                                    className="w-16 p-1 bg-gray-800 border border-gray-700 rounded text-white"
                                    value={item.cantidad}
                                    onChange={(e) => actualizarItem(item.id, "cantidad", Number(e.target.value))}
                                />
                            </td>

                            <td className="p-2">
                                {esSaldoAnterior ? (
                                    <div className="flex items-center gap-1">
                                        <span className="text-yellow-500">$</span>
                                        <input
                                            type="number"
                                            className="w-24 p-1 bg-yellow-900/20 border border-yellow-600 rounded text-white font-bold"
                                            value={item.precio_unitario}
                                            onChange={(e) => actualizarItem(item.id, "precio_unitario", Number(e.target.value))}
                                            placeholder="0.00"
                                        />
                                    </div>
                                ) : (
                                    <span className="text-gray-300 font-mono">$ {item.precio_unitario}</span>
                                )}
                            </td>

                            <td className="p-2 text-right font-bold text-white">
                                $ {item.subtotal.toLocaleString()}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}