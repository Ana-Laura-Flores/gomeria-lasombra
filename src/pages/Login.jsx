import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import { login } from "../services/api-login";
import { useAuth } from "../context/AuthContext";
import jwt_decode from "jwt-decode";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { loginUser } = useAuth(); // <-- usamos contexto

const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await login(email, password);

    const token = res.data.access_token;

    // Decodificar token
    const decoded = jwt_decode(token);
    // decoded.id, decoded.admin_access, etc.
    const user = {
      id: decoded.id,
      role: decoded.admin_access ? "admin" : "user",
      email: email, // opcional
    };

    // Guardar en contexto y localStorage
    loginUser(token, user);

    navigate("/dashboard");
  } catch (error) {
    alert("Login incorrecto");
    console.error(error);
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
