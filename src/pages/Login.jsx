import { useState } from "react";
import { login } from "../services/api-login";
import { useNavigate } from "react-router-dom";

export default function Login({ setToken, setRole }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await login(email, password);

      const token = res.data.access_token;
      const role = res.data.user.role.name;

      // GUARDAR
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      // ESTADO GLOBAL
      setToken(token);
      setRole(role);

      navigate("/dashboard");
    } catch (error) {
      alert("Login incorrecto");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Ingresar</button>
    </form>
  );
}
