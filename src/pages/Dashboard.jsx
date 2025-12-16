import React from "react";
import MainLayout from "../layouts/MainLayout";

export default function Dashboard() {
  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-400">
        Bienvenida al sistema de gestión de Gomería La Sombra.
      </p>
    </MainLayout>
  );
}

