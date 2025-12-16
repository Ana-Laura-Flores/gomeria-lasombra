export const API_URL = import.meta.env.VITE_API_URL;

// Headers de autenticación
export const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Fetch genérico
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

  return res.json();
};

// --------------------
// Items de orden
// --------------------
export const getItems = async () => {
  // Trae items_orden con tarifa y el servicio relacionado
  return apiFetch(
    "items_orden?fields=*,tarifa.id,tarifa.precio,tarifa.tipo_vehiculo,tarifa.servicio.id,tarifa.servicio.nombre"
  );
};

// --------------------
// Servicios con tarifas
// --------------------
export const getServicios = async () => {
  // Trae servicios y sus tarifas (para poder filtrar por tipo de vehículo)
  return apiFetch(
    "servicios?fields=*,tarifas.id,tarifas.precio,tarifas.tipo_vehiculo"
  );
};

// --------------------
// Clientes (para useClientes)
// --------------------
export const getClientes = async () => {
  return apiFetch(
    "clientes?fields=id,nombre,apellido,telefono,email"
  );
};
