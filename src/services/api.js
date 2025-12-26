export const API_URL = import.meta.env.VITE_API_URL;

// --------------------
// Fetch para ITEMS (/items)
// --------------------
export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_URL}/items/${endpoint}`;

  const res = await fetch(url, {
    ...options,
    credentials: "include", // 👈 CLAVE
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    window.location.href = "/login";
    return;
  }

  if (!res.ok) {
    throw new Error(`Error API: ${res.status}`);
  }

  return res.json();
};

// --------------------
// Fetch para endpoints NO items
// (fields, auth, etc)
// --------------------
export const apiFetchSystem = async (endpoint, options = {}) => {
  const url = `${API_URL}/${endpoint}`;

  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    window.location.href = "/login";
    return;
  }

  if (!res.ok) {
    throw new Error(`Error API: ${res.status}`);
  }

  return res.json();
};

// --------------------
// Tarifas
// --------------------
export const getTarifas = async () =>
  apiFetch(
    "tarifas?fields=id,precio,tipo_vehiculo,servicio.id,servicio.nombre"
  );

// --------------------
// Items de orden
// --------------------
export const getItemsOrden = async () =>
  apiFetch(
    "items_orden?fields=*,tarifa.id,tarifa.precio,tarifa.tipo_vehiculo,tarifa.servicio.id,tarifa.servicio.nombre"
  );

// --------------------
// Servicios
// --------------------
export const getServicios = async () =>
  apiFetch(
    "servicios?fields=*,tarifas.id,tarifas.precio,tarifas.tipo_vehiculo"
  );

// --------------------
// Clientes
// --------------------
export const getClientes = async () =>
  apiFetch("clientes?fields=id,nombre,apellido,telefono,email");

// --------------------
// Órdenes
// --------------------
export const getOrdenesTrabajo = async () =>
  apiFetch(
    "ordenes_trabajo?fields=*,cliente.id,cliente.nombre,pagos.*,items_orden.*"
  );

export const getOrdenTrabajoById = async (id) =>
  apiFetch(
    `ordenes_trabajo/${id}?fields=*,cliente.id,cliente.nombre,pagos.*,items_orden.*,items_orden.tarifa.servicio.nombre`
  );

// --------------------
// Comprobantes
// --------------------
export const getUltimoComprobante = async () => {
  const res = await apiFetch(
    "ordenes_trabajo?fields=comprobante&sort=-comprobante&limit=1"
  );
  return res.data[0]?.comprobante || null;
};

export const generarNumeroComprobante = async () => {
  const ultimo = await getUltimoComprobante();
  let siguiente = ultimo ? Number(ultimo) + 1 : 1;
  return String(siguiente).padStart(6, "0");
};

// --------------------
// Dashboard
// --------------------
export const getDashboardOrdenes = async (desde, hasta) =>
  apiFetch(
    `ordenes_trabajo?fields=id,total,total_pagado,saldo,fecha&filter[fecha][_between]=${desde},${hasta}`
  );

// --------------------
// Cuenta corriente
// --------------------
export const getCuentaCorriente = async () =>
  apiFetch(
    "ordenes_trabajo" +
      "?fields=id,fecha,total,total_pagado,saldo,condicion_cobro," +
      "cliente.id,cliente.nombre," +
      "pagos.id,pagos.fecha,pagos.metodo_pago,pagos.monto,pagos.estado" +
      "&filter[condicion_cobro][_eq]=cuenta_corriente"
  );

// --------------------
// Pagos
// --------------------
export const crearPago = async (pago) =>
  apiFetch("pagos", {
    method: "POST",
    body: JSON.stringify({
      orden: pago.orden,
      metodo_pago: pago.metodo_pago,
      monto: Number(pago.monto),
      fecha: pago.fecha || new Date().toISOString(),
      observaciones: pago.observaciones || "",
      estado: "confirmado",
    }),
  });

export const getPagosByOrden = async (ordenId) =>
  apiFetch(
    `pagos?filter[orden][_eq]=${ordenId}&fields=*,orden.id`
  );

export const actualizarOrden = async (id, data) =>
  apiFetch(`ordenes_trabajo/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const getPagosPorMes = async (desde, hasta) =>
  apiFetch(
    `pagos?filter[fecha][_between]=${desde},${hasta}`
  );

// --------------------
// Fields (NO items)
// --------------------
export const getMetodosPagoField = async () => {
  const res = await apiFetchSystem("fields/pagos/metodo_pago");
  return res.data.meta?.options?.choices || [];
};

// --------------------
// Gastos
// --------------------
export const getGastos = async () =>
  apiFetch("gastos?sort=-fecha&fields=*,categoria.nombre");

export const crearGasto = async (data) =>
  apiFetch("gastos", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getCategoriasGasto = async () =>
  apiFetch("categorias_gasto?filter[activo][_eq]=true");

export const getGastosPrefijados = async () =>
  apiFetch("gastos_prefijados?filter[activo][_eq]=true");

export const getGastosPorMes = async (desde, hasta) =>
  apiFetch(
    `gastos?fields=id,monto,fecha&filter[fecha][_between]=${desde},${hasta}`
  );
