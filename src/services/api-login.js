// src/services/api-login.js
const API_URL = "https://vps-5529044-x.dattaweb.com"; // reemplaza con tu URL de Directus

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Error en login");
  return res.json(); // devuelve el token y datos del usuario
}
