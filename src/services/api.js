// src/services/api.js
export const API_URL = import.meta.env.VITE_API_URL;

export const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

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


// src/services/api.js
export const getItems = async () => {
  // Trae items_orden con tarifa y el servicio relacionado
  return apiFetch(
    "items_orden?fields=*,tarifa.id,tarifa.precio,tarifa.tipo_vehiculo,tarifa.servicio.id,tarifa.servicio.nombre"
  );
};


