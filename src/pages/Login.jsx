import React, { useState, useEffect } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { login } from "../services/api-login";



export default function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userData = await login(email, password); // llamada a Directus
      localStorage.setItem("token", userData.access_token); // guardamos token
      setToken(userData.access_token); // actualizamos estado
    } catch (error) {
      console.error("Error en login:", error.message);
      alert("Email o contraseña incorrectos");
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-100">
          Login Gomería La Sombra
        </h2>

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ingrese su email"
        />

        <Input
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ingrese su contraseña"
        />

        <Button type="submit">Ingresar</Button>
      </form>
    </div>
  );
}
