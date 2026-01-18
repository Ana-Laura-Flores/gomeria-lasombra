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
      // 1. Llamamos al servicio (que ya guarda token y refresh_token en localStorage)
      const data = await login(email, password);
      
      const token = data.access_token;
      const decoded = jwt_decode(token);

      // 2. Armamos el objeto de usuario. 
      // Nota: Si Directus no trae el role en el token, podrías necesitar 
      // una llamada extra, pero probemos primero si tu configuración actual lo trae.
      const user = {
        id: decoded.id,
        role: decoded.role || ROLES.ADMIN, // Fallback por si no viene el role
        email: email, // Usamos el email del estado del form
      };

      // 3. Informamos al contexto de autenticación
      loginUser(token, user);

      // 4. Redirección por Rol
      if (user.role === ROLES.ADMIN) {
        navigate("/dashboard");
      } else {
        navigate("/ordenes");
      }
    } catch (error) {
      console.error("Error en login:", error);
      alert(error.message || "Email o contraseña incorrectos");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-700"
      >
        <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
              Gomería <span className="text-blue-500">La Sombra</span>
            </h2>
            <p className="text-gray-400 text-sm mt-2">Gestión de Órdenes y Stock</p>
        </div>

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nombre@ejemplo.com"
          required
        />

        <div className="relative">
          <Input
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="pr-10"
            required
          />

          {password.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-gray-500 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        <div className="mt-6">
            <Button type="submit">Ingresar al Sistema</Button>
        </div>
        
        <p className="mt-8 text-center text-xs text-gray-600">
            Acceso restringido para personal autorizado.
        </p>
      </form>
    </div>
  );
}