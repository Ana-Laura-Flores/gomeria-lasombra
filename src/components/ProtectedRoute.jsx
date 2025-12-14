// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // Si no hay token, redirigimos al login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Si hay token, mostramos la ruta protegida (el Dashboard)
  return children;
}
