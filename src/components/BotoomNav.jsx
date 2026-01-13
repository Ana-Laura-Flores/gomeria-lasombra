import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";

export default function BottomNav() {
    const { user } = useAuth();
    const location = useLocation();

    const isActive = (path) =>
        location.pathname === path ? "text-blue-400" : "text-gray-300";

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 flex justify-around py-2 md:hidden z-50">
            {/* SOLO ADMIN */}
            {user?.role === ROLES.ADMIN && (
                <>
                    <Link
                        to="/dashboard"
                        className={`flex flex-col items-center text-sm ${isActive(
                            "/dashboard"
                        )}`}
                    >
                        📊
                        <span>Dashboard</span>
                    </Link>
                </>
            )}

            {(user?.role === ROLES.ADMIN || user?.role === ROLES.EMPLEADO) && (
                <>
                    <Link
                        to="/ordenes"
                        className={`flex flex-col items-center text-sm ${isActive(
                            "/ordenes"
                        )}`}
                    >
                        📋
                        <span>Órdenes</span>
                    </Link>

                    <Link
                        to="/ordenes/nueva"
                        className={`flex flex-col items-center text-sm ${isActive(
                            "/ordenes/nueva"
                        )}`}
                    >
                        ➕<span>Nueva</span>
                    </Link>
                    <Link
                        to="/cuenta-corriente"
                        className={`flex flex-col items-center text-sm ${isActive(
                            "/cuenta-corriente"
                        )}`}
                    >
                        📒
                        <span>Cuenta</span>
                    </Link>
                     {/* 🆕 CLIENTES */}
          <Link
            to="/clientes"
            className={`flex flex-col items-center text-sm ${isActive("/clientes")}`}
          >
            👥
            <span>Clientes</span>
          </Link>
                    <Link
                        to="/gastos/nuevo"
                        className={`flex flex-col items-center text-sm ${isActive(
                            "/gastos/nuevo"
                        )}`}
                    >
                        💸
                        <span>Nuevo gasto</span>
                    </Link>
                    <Link
  to="/precios"
  className={`flex flex-col items-center text-sm ${isActive("/precios")}`}
>
  🏷️
  <span>Precios</span>
</Link>

                </>
            )}

            {/* SOLO EMPLEADO
      {user?.role === ROLES.EMPLEADO && (
       
      )} */}

            {/* SOLO ADMIN */}
            {user?.role === ROLES.ADMIN && (
                <>
                    <Link
                        to="/gastos"
                        className={`flex flex-col items-center text-sm ${isActive(
                            "/gastos"
                        )}`}
                    >
                        💸
                        <span>Gastos</span>
                    </Link>
                </>
            )}
        </nav>
    );
}
