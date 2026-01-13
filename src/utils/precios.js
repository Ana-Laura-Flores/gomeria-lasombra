export function normalizarTarifas(tarifas) {
  const mapa = {};

  tarifas.forEach(t => {
    const servicio = t.servicio;
    if (!servicio) return;

    const key = servicio.id;

    if (!mapa[key]) {
      mapa[key] = {
        id: `servicio-${servicio.id}`,
        nombre: servicio.nombre,
        tipo: "Servicio",
      };
    }

    mapa[key][t.tipo_vehiculo] = Number(t.precio);
  });

  return Object.values(mapa);
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

export function unirPrecios(tarifas, productos) {
  return [
    ...normalizarTarifas(tarifas),
    ...normalizarProductos(productos),
  ];
}

