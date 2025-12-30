import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";

export default function Sidebar() {
    const { user } = useAuth();

    return (
        <aside className="hidden md:flex w-64 bg-gray-800 text-gray-100 min-h-screen flex-col">
            <div className="p-6 text-xl font-bold border-b border-gray-700">
                Gomería La Sombra
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {user?.role === ROLES.ADMIN && (
                    <>
                        <Link
                            to="/dashboard"
                            className="block px-4 py-2 rounded hover:bg-gray-700"
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/gastos"
                            className="block px-4 py-2 rounded hover:bg-gray-700"
                        >
                            Gastos
                        </Link>
                    </>
                )}

                {(user?.role === ROLES.ADMIN ||
                    user?.role === ROLES.EMPLEADO) && (
                    <>
                    <Link
                    to="/ordenes"
                            className="block px-4 py-2 rounded hover:bg-gray-700"

                    >
                      Ordenes
                    </Link>
                        <Link
                            to="/ordenes/nueva"
                            className="block px-4 py-2 rounded hover:bg-gray-700"
                        >
                            Nueva Orden
                        </Link>
                        <Link
                            to="/gastos/nuevo"
                            className="block px-4 py-2 rounded hover:bg-gray-700"
                        >
                            Nuevo gasto
                        </Link>
                        <Link
                            to="/cuenta-corriente"
                            className="block px-4 py-2 rounded hover:bg-gray-700"
                        >
                            Cuentas Corrientes
                        </Link>
                    </>
                )}
              
            </nav>
        </aside>
    );
}
