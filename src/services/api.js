export const API_URL = import.meta.env.VITE_API_URL;

// --------------------
// Headers de autenticación
// --------------------
export const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// --------------------
// Fetch genérico
// --------------------
export const apiFetch = async (endpoint, options = {}) => {
  const res = await fetch(`${API_URL}/items/${endpoint}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Error al llamar a API: ${res.statusText}`);
  }

  return res.json(); // devuelve { data: [...] }
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
    "ordenes_trabajo?fields=*,cliente.id,cliente.nombre,pagos.*,items_orden.*"
  );
};

export const getOrdenTrabajoById = async (id) => {
  return apiFetch(
    `ordenes_trabajo/${id}?fields=*,cliente.id,cliente.nombre,pagos.*,items_orden.*,items_orden.tarifa.servicio.nombre`
  );
};

export const getDashboardOrdenes = async () => {
  return apiFetch(
    "ordenes_trabajo?fields=id,total,total_pagado,saldo"
  );
};

// Traer todas las órdenes para cuenta corriente
export const getCuentaCorriente = async () => {
  return apiFetch("ordenes_trabajo?fields=*,cliente.id,cliente.nombre,total,total_pagado,saldo");
};



