export function normalizarServicios(servicios) {
  return servicios.map(s => {
    const fila = {
      id: `servicio-${s.id}`,
      nombre: s.nombre,
      tipo: "Servicio",
    };

    s.tarifas?.forEach(t => {
      fila[t.tipo_vehiculo] = Number(t.precio);
    });

    return fila;
  });
}

export function normalizarProductos(productos) {
  return productos.map(p => {
    const fila = {
      id: `producto-${p.id}`,
      nombre: p.nombre,
      tipo: "Producto",
    };

    p.tarifas?.forEach(t => {
      fila[t.tipo_vehiculo] = Number(t.precio);
    });

    return fila;
  });
}

export function unirPrecios(servicios, productos) {
  return [
    ...normalizarServicios(servicios),
    ...normalizarProductos(productos),
  ];
}
