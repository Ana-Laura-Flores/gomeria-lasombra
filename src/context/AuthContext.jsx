import React, { createContext, useContext, useState, useEffect } from "react";

// Creamos el contexto
const AuthContext = createContext();

// Provider que envolverá toda la app
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const isLoggedIn = !!token;

  // Función para hacer login
  const loginUser = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isLoggedIn, loading, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar auth más fácil
export const useAuth = () => useContext(AuthContext);
