import Sidebar from "../components/Sidebar";
import React from "react";

export default function MainLayout({ children }) {
  return (
    <div className="flex bg-gray-900 text-gray-100 min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
