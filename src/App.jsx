import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ROLES } from "./constants/roles";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NuevaOrden from "./pages/NuevaOrden";
import Ordenes from "./pages/Ordenes";
import OrdenDetalle from "./pages/OrdenDetalle";
import CuentaCorriente from "./pages/CuentaCorriente";
import Pagos from "./pages/Pagos";


function ProtectedRoute({ children, allowedRoles }) {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/ordenes" />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* SOLO ADMIN */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cuenta-corriente"
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <CuentaCorriente />
              </ProtectedRoute>
            }
          />

          {/* ADMIN + EMPLEADO */}
          <Route
            path="/ordenes"
            element={
              <ProtectedRoute
                allowedRoles={[ROLES.ADMIN, ROLES.EMPLEADO]}
              >
                <Ordenes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ordenes/nueva"
            element={
              <ProtectedRoute
                allowedRoles={[ROLES.ADMIN, ROLES.EMPLEADO]}
              >
                <NuevaOrden />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ordenes/:id"
            element={
              <ProtectedRoute
                allowedRoles={[ROLES.ADMIN, ROLES.EMPLEADO]}
              >
                <OrdenDetalle />
              </ProtectedRoute>
            }
          />
<Route
  path="/pagos/nuevo"
  element={
    <ProtectedRoute>
      <Pagos />
    </ProtectedRoute>
  }
/>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
