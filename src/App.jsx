 import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
 import React, { useState } from "react";
 import Login from "./pages/Login";
 import Dashboard from "./pages/Dashboard";
 import NuevaOrden from "./pages/NuevaOrden";
import Ordenes from "./pages/Ordenes";
import OrdenDetalle from "./pages/OrdenDetalle"

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
          <Route path="/ordenes/nueva" element={<NuevaOrden />} />
        <Route path="/ordenes" element={<Ordenes />}/>
         <Route path="/ordenes/:id" element={<OrdenDetalle />} />
       </Routes>
     </Router>
   );
 }

