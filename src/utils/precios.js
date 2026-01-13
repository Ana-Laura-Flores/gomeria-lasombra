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
  const mapa = {};

  productos.forEach(p => {
    const key = p.nombre;

    if (!mapa[key]) {
      mapa[key] = {
        id: `producto-${p.id}`,
        nombre: p.nombre,
        tipo: "Producto",
      };
    }

    mapa[key][p.tipo_vehiculo] = Number(p.precio_unitario);
  });

  return Object.values(mapa);
}


export function unirPrecios(servicios, productos) {
  return [
    ...normalizarServicios(servicios),
    ...normalizarProductos(productos),
  ];
}
