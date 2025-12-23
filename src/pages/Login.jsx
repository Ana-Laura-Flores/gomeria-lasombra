import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import { login } from "../services/api-login";
import { useAuth } from "../context/AuthContext";
import jwt_decode from "jwt-decode";
import { ROLES } from "../constants/roles";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await login(email, password);
      const token = res.data.access_token;
      const decoded = jwt_decode(token);

      const user = {
        id: decoded.id,
        role: decoded.role,
        email: decoded.email,
      };

      loginUser(token, user);

      if (decoded.role === ROLES.ADMIN) {
        navigate("/dashboard");
      } else {
        navigate("/ordenes");
      }
    } catch (error) {
      console.error(error);
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

        {/* CONTRASEÑA CON OJITO */}
        <div className="relative">
          <Input
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingrese su contraseña"
            className="pr-10"
          />

          {password.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-100"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        <Button type="submit">Ingresar</Button>
      </form>
    </div>
  );
}
