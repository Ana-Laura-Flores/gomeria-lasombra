import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import React, { useState } from "react";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NuevaOrden from "./pages/NuevaOrden";
import Ordenes from "./pages/Ordenes";
import OrdenDetalle from "./pages/OrdenDetalle";

export default function App() {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [role, setRole] = useState(localStorage.getItem("role"));
    const isLoggedIn = !!token;

    return (
        <Router>
            <Routes>
                <Route
                    path="/login"
                    element={<Login setToken={setToken} setRole={setRole} />}
                />

                <Route
                    path="/dashboard"
                    element={
                        isLoggedIn && role === "admin" ? (
                            <Dashboard />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />

                <Route
                    path="/ordenes"
                    element={
                        isLoggedIn ? <Ordenes /> : <Navigate to="/login" />
                    }
                />

                <Route
                    path="/ordenes/nueva"
                    element={
                        isLoggedIn ? <NuevaOrden /> : <Navigate to="/login" />
                    }
                />

                <Route
                    path="/ordenes/:id"
                    element={
                        isLoggedIn ? <OrdenDetalle /> : <Navigate to="/login" />
                    }
                />

                {/* SIEMPRE AL FINAL */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}
