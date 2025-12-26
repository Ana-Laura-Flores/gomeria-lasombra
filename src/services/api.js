export const API_URL = import.meta.env.VITE_API_URL;

// --------------------
// Headers de autenticación
// --------------------
export const authHeaders = () => ({
  "Content-Type": "application/json",
  
});

// --------------------
// Fetch genérico
// --------------------
export const apiFetch = async (endpoint, options = {}) => {
  const res = await fetch(`${API_URL}/items/${endpoint}`, {
    cache: "no-store", // 👈 ACÁ
    credentials: "include", 
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Error al llamar a API: ${res.statusText}`);
  }

  return res.json();
};


// --------------------
// Tarifas (para tipos de vehículo y precios)
// --------------------
export const getTarifas = async () => {
  return apiFetch(
    "tarifas?fields=id,precio,tipo_vehiculo,servicio.id,servicio.nombre"
  );
};

// --------------------
// Items de orden
// --------------------
export const getItemsOrden = async () => {
  return apiFetch(
    "items_orden?fields=*,tarifa.id,tarifa.precio,tarifa.tipo_vehiculo,tarifa.servicio.id,tarifa.servicio.nombre"
  );
};

// --------------------
// Servicios con tarifas
// --------------------
export const getServicios = async () => {
  return apiFetch(
    "servicios?fields=*,tarifas.id,tarifas.precio,tarifas.tipo_vehiculo"
  );
};

// --------------------
// Clientes
// --------------------
export const getClientes = async () => {
  return apiFetch(
    "clientes?fields=id,nombre,apellido,telefono,email"
  );
};

export const getOrdenesTrabajo = async () => {
  return apiFetch(
    "ordenes_trabajo?fields=*, cliente.id,cliente.nombre,pagos.*,items_orden.*"
  );
};

export const getOrdenTrabajoById = async (id) => {
  return apiFetch(
    `ordenes_trabajo/${id}?fields=*, cliente.id,cliente.nombre,pagos.*,items_orden.*,items_orden.tarifa.servicio.nombre`
  );
};

// --------------------
// Último comprobante
// --------------------
export const getUltimoComprobante = async () => {
  const res = await apiFetch(
    "ordenes_trabajo?fields=comprobante&sort=-comprobante&limit=1"
  );
  return res.data[0]?.comprobante || null;
};

export const generarNumeroComprobante = async () => {
  const ultimo = await getUltimoComprobante();
  let siguiente = 1;
  if (ultimo) {
    siguiente = Number(ultimo) + 1;
  }
  return String(siguiente).padStart(6, "0"); // Ej: 000001
};


export const getDashboardOrdenes = async (desde, hasta) => {
  return apiFetch(
    `ordenes_trabajo?fields=id,total,total_pagado,saldo,fecha&filter[fecha][_between]=${desde},${hasta}`
  );
};

// Traer todas las órdenes para cuenta corriente
export const getCuentaCorriente = async () => {
  return apiFetch(
    "ordenes_trabajo" +
      "?fields=id,fecha,total,total_pagado,saldo,condicion_cobro," +
      "cliente.id,cliente.nombre," +
      "pagos.id,pagos.fecha,pagos.metodo_pago,pagos.monto,pagos.estado" +
      "&filter[condicion_cobro][_eq]=cuenta_corriente"
  );
};





// --------------------
// PAGOS
// --------------------
export const crearPago = async (pago) => {
  return apiFetch("pagos", {
    method: "POST",
    body: JSON.stringify({
      orden: pago.orden,                // ID de la orden
      metodo_pago: pago.metodo_pago,
      monto: Number(pago.monto),
      fecha: pago.fecha || new Date().toISOString(),
      observaciones: pago.observaciones || "",
      estado: "confirmado",
    
    }),
  });
};

// Traer pagos de una orden
export const getPagosByOrden = async (ordenId) => {
  return apiFetch(
    `pagos?filter[orden][_eq]=${ordenId}&fields=*,orden.id`
  );
};

export const actualizarOrden = async (id, data) => {
  return apiFetch(`ordenes_trabajo/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const getPagosPorMes = async (desde, hasta) => {
  return apiFetch(
    `pagos?filter[fecha][_between]=${desde},${hasta}`
  );
};

// services/api.js
export const getMetodosPagoField = async () => {
  const res = await fetch(
    `${API_URL}/fields/pagos/metodo_pago`,
    {
      credentials: "include",
      headers: authHeaders(), // 👈 seguimos usando auth
    }
  );

  if (!res.ok) {
    throw new Error("Error al cargar métodos de pago");
  }

  const json = await res.json();
  return json.data.meta?.options?.choices || [];
};


// GASTOS
export const getGastos = async () =>
  apiFetch("gastos?sort=-fecha&fields=*,categoria.nombre");

export const crearGasto = async (data) =>
  apiFetch("gastos", { method: "POST", body: JSON.stringify(data) });

export const getCategoriasGasto = async () =>
  apiFetch("categorias_gasto?filter[activo][_eq]=true");

export const getGastosPrefijados = async () =>
  apiFetch("gastos_prefijados?filter[activo][_eq]=true");

export const getGastosPorMes = async (desde, hasta) => {
  return apiFetch(
    `gastos?fields=id,monto,fecha&filter[fecha][_between]=${desde},${hasta}`
  );
};



