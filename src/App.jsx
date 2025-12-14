import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const isLoggedIn = !!token;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route
          path="/dashboard"
          element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
