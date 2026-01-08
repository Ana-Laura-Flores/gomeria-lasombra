// ================================
// CONFIG
// ================================
export const API_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem("token");

// ================================
// FETCH BASE
// ================================
export const apiFetch = async (endpoint, options = {}) => {
  let url = endpoint.startsWith("http")
    ? endpoint
    : `${API_URL}/items/${endpoint}`;

  const method = (options.method || "GET").toUpperCase();

  // Solo para endpoints realtime
  if (method === "GET" && options.realtime) {
    const sep = url.includes("?") ? "&" : "?";
    url += `${sep}_=${Date.now()}`;
  }

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
    body: options.body,
    cache: options.realtime ? "no-store" : "default",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API error ${res.status}`);
  }

  return res.json();
};

// ================================
// ÓRDENES DE TRABAJO
// ================================

// Listado rápido (dashboard / home)
export const getOrdenesTrabajo = async () => {
  return apiFetch(
    "ordenes_trabajo?sort=-id&limit=30&fields=id,fecha,total,estado,comprobante,cliente.nombre",
    { realtime: true }
  );
};

// Detalle completo
export const getOrdenTrabajoById = async (id) => {
  return apiFetch(
    `ordenes_trabajo/${id}?fields=
      id,fecha,total,estado,comprobante,
      cliente.id,cliente.nombre,cliente.telefono,
      pagos.id,pagos.monto,pagos.fecha,pagos.metodo_pago,
      items_orden.id,items_orden.cantidad,
      items_orden.tarifa.precio,
      items_orden.tarifa.servicio.nombre`
  );
};

// Crear orden (respuesta mínima)
export const crearOrden = async (data) => {
  const res = await apiFetch("ordenes_trabajo", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
};

// Actualizar orden
export const actualizarOrden = async (id, data) => {
  const res = await apiFetch(`ordenes_trabajo/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res.data;
};

// ================================
// COMPROBANTES (FRONTEND, OPTIMIZADO)
// ================================

// Trae solo el último comprobante (1 campo, 1 fila)
export const getUltimoComprobante = async () => {
  const res = await apiFetch(
    "ordenes_trabajo?fields=comprobante&sort=-comprobante&limit=1",
    { realtime: true }
  );
  return res.data?.[0]?.comprobante || null;
};

export const generarNumeroComprobante = async () => {
  const ultimo = await getUltimoComprobante();
  const siguiente = ultimo ? Number(ultimo) + 1 : 1;
  return String(siguiente).padStart(6, "0");
};

// ================================
// PAGOS
// ================================

export const crearPago = async (pago) => {
  const res = await apiFetch("pagos", {
    method: "POST",
    body: JSON.stringify({
      orden: pago.orden,
      cliente: pago.cliente,
      metodo_pago: pago.metodo_pago,
      monto: Number(pago.monto),
      fecha: pago.fecha || new Date().toISOString(),
      estado: "confirmado",
      banco: pago.banco || null,
      numero_cheque: pago.numero_cheque || null,
      fecha_cobro: pago.fecha_cobro || null,
    }),
  });
  return res.data;
};

export const getPagosByOrden = async (ordenId) => {
  return apiFetch(
    `pagos?filter[orden][_eq]=${ordenId}&fields=id,monto,fecha,metodo_pago`
  );
};

export const getPagosCliente = async (clienteId) => {
  return apiFetch(
    `pagos?filter[cliente][_eq]=${clienteId}&filter[estado][_eq]=confirmado&fields=id,monto,fecha,orden.id`
  );
};

// ================================
// CLIENTES
// ================================

export const getClientes = async () => {
  return apiFetch(
    "clientes?fields=id,nombre,apellido,telefono,email"
  );
};

export const getClienteById = async (id) => {
  return apiFetch(`clientes/${id}?fields=id,nombre,saldo_cc`);
};

export const actualizarCliente = async (id, data) => {
  const res = await apiFetch(`clientes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res.data;
};

// ================================
// CUENTA CORRIENTE
// ================================

export const getCuentaCorrienteByCliente = async (clienteId) => {
  if (!clienteId) return { data: [] };

  return apiFetch(
    `cuenta_corriente?filter[cliente][_eq]=${clienteId}&limit=1&fields=id,saldo,total_pagos,total_ordenes,saldo_actualizado`
  );
};

export const actualizarCuentaCorriente = async (id, data) => {
  const res = await apiFetch(`cuenta_corriente/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res.data;
};

// ================================
// TARIFAS / SERVICIOS / PRODUCTOS
// (datos casi estáticos → cacheables)
// ================================

export const getTarifas = async () => {
  return apiFetch(
    "tarifas?fields=id,precio,tipo_vehiculo,servicio.id,servicio.nombre"
  );
};

export const getServicios = async () => {
  return apiFetch(
    "servicios?fields=id,nombre"
  );
};

export const getProductos = async (tipoVehiculo) => {
  return apiFetch(
    `productos?filter[tipo_vehiculo][_eq]=${tipoVehiculo}&filter[estado][_eq]=activo&fields=id,nombre,precio`
  );
};

// ================================
// DASHBOARD
// ================================

export const getDashboardOrdenes = async (desde, hasta) => {
  return apiFetch(
    `ordenes_trabajo?fields=id,fecha,total,total_pagado,saldo&filter[fecha][_between]=${desde},${hasta}`
  );
};
