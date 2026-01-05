// src/services/api-login.js
const API_URL = import.meta.env.VITE_API_URL;

// login.js
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
  localStorage.setItem("access_token", data?.data?.access_token || data?.access_token);
  localStorage.setItem("refresh_token", data?.data?.refresh_token || data?.refresh_token);
  const expires = data?.data?.expires || data?.expires || 3600;
  localStorage.setItem("access_token_expires", Date.now() + expires * 1000);

  return data;
}
