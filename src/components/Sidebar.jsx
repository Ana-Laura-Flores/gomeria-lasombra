import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";



export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="w-64 bg-gray-800 text-gray-100 min-h-screen flex flex-col">
      <div className="p-6 text-xl font-bold border-b border-gray-700">
        Gomería La Sombra
      </div>

      <nav className="flex-1 p-4 space-y-2">

        {/* SOLO ADMIN */}
        {user?.role === ROLES.ADMIN && (
          <Link
            to="/dashboard"
            className="block px-4 py-2 rounded hover:bg-gray-700"
          >
            Dashboard
          </Link>
        )}

        {/* ADMIN + EMPLEADO */}
        {(user?.role === ROLES.ADMIN ||
          user?.role === ROLES.EMPLEADO) && (
          <>
            <Link
              to="/ordenes"
              className="block px-4 py-2 rounded hover:bg-gray-700"
            >
              Órdenes
            </Link>

            <Link
              to="/ordenes/nueva"
              className="block px-4 py-2 rounded hover:bg-gray-700"
            >
              Nueva Orden
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}

