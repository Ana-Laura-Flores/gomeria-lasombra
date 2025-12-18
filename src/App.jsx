import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NuevaOrden from "./pages/NuevaOrden";
import Ordenes from "./pages/Ordenes";
import OrdenDetalle from "./pages/OrdenDetalle";
import CuentaCorriente from "./components/CuentaCorriente";

function ProtectedRoute({ children, adminOnly = false }) {
    const { isLoggedIn, user } = useAuth();

    if (!isLoggedIn) return <Navigate to="/login" />;
    if (adminOnly && user?.role !== "admin") return <Navigate to="/login" />;
    return children;
}

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute adminOnly={true}>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/cuenta-corriente"
                        element={
                            <ProtectedRoute>
                                <CuentaCorriente ordenes={ordenes} />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/ordenes"
                        element={
                            <ProtectedRoute>
                                <Ordenes />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/ordenes/nueva"
                        element={
                            <ProtectedRoute>
                                <NuevaOrden />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/ordenes/:id"
                        element={
                            <ProtectedRoute>
                                <OrdenDetalle />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}
