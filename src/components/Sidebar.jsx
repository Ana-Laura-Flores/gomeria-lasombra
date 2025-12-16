import { Link } from "react-router-dom";
import React from "react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-gray-100 min-h-screen flex flex-col">
      <div className="p-6 text-xl font-bold border-b border-gray-700">
        Gomería La Sombra
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Link
          to="/dashboard"
          className="block px-4 py-2 rounded hover:bg-gray-700"
        >
          Dashboard
        </Link>

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
      </nav>
    </aside>
  );
}
