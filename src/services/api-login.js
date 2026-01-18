// src/services/api-login.js
const API_URL = import.meta.env.VITE_API_URL;

export async function login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email,
            password,
            mode: "json", // Importante para que Directus devuelva el refresh_token en el JSON
        }),
    });

    if (!res.ok) {
        // Intentamos parsear el error de Directus para que sea más legible
        const errorData = await res.json().catch(() => ({}));
        const mensaje = errorData.errors?.[0]?.message || "Credenciales incorrectas";
        throw new Error(mensaje);
    }

    const { data } = await res.json();

    // GUARDAMOS AMBOS TOKENS
    // El access_token es el que usás en cada llamada (Bearer)
    // El refresh_token es el que permite renovar la sesión sin pedir clave
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    
    // También podés guardar el tiempo de expiración si querés ser más preciso
    localStorage.setItem("expires", Date.now() + data.expires);

    return data;
}