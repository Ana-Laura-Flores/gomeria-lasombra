// src/services/api-login.js
const API_URL = import.meta.env.VITE_API_URL;

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, mode: "json" }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  const data = await res.json();

  // Guardar tokens en localStorage
  localStorage.setItem("access_token", data.data.access_token);
  localStorage.setItem("refresh_token", data.data.refresh_token);

  // Guardar fecha de expiración del access token (opcional)
  const expiresAt = Date.now() + data.data.expires * 1000;
  localStorage.setItem("access_token_expires", expiresAt);

  return data.data;
}
export async function refreshToken() {
  const refresh_token = localStorage.getItem("refresh_token");
  if (!refresh_token) throw new Error("No hay refresh token");

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { Authorization: `Bearer ${refresh_token}` },
  });

  if (!res.ok) {
    // Si falla, limpiar tokens y obligar a login
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("access_token_expires");
    throw new Error("No se pudo refrescar token");
  }

  const data = await res.json();
  localStorage.setItem("access_token", data.data.access_token);
  localStorage.setItem("refresh_token", data.data.refresh_token);

  const expiresAt = Date.now() + data.data.expires * 1000;
  localStorage.setItem("access_token_expires", expiresAt);

  return data.data.access_token;
}
