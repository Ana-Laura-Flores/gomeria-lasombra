export const API_URL = import.meta.env.VITE_API_URL;

export const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Función genérica para hacer fetch a Directus
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
