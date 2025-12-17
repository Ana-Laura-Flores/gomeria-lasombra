import React, { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { Link } from "react-router-dom";
import { getOrdenesTrabajo } from "../services/api";

export default function Ordenes() {
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrdenes = async () => {
            try {
                const res = await getOrdenesTrabajo();
                const data = Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data?.data)
                    ? res.data.data
                    : [];

                setOrdenes(data);
            } catch (err) {
                console.error("Error cargando órdenes:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrdenes();
    }, []);

    if (loading) {
        return (
            <MainLayout>
                <p>Cargando órdenes...</p>
            </MainLayout>
        );
    }
    const getEstadoVisual = (orden) => {
        const total = Number(orden.total) || 0;
        const saldo = Number(orden.saldo) || 0;

        if (saldo === 0 && total > 0) {
            return { label: "Pagado", className: "bg-green-700" };
        }

        if (saldo > 0 && saldo < total) {
            return { label: "Parcial", className: "bg-yellow-700" };
        }

        return { label: "Debe", className: "bg-red-700" };
    };

    return (
        <MainLayout>
            <h1 className="text-2xl font-bold mb-6">Órdenes</h1>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-gray-700 text-left">
                            <th className="p-2">Fecha</th>
                            <th className="p-2">Comprobante</th>
                            <th className="p-2">Cliente</th>
                            <th className="p-2">Patente</th>
                            <th className="p-2">Método pago</th>
                            <th className="p-2">Total</th>
                            <th className="p-2">Pagado</th>
                            <th className="p-2">Saldo</th>
                            <th className="p-2">Estado</th>
                            <th className="p-2">Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {ordenes.length === 0 && (
                            <tr>
                                <td
                                    colSpan="10"
                                    className="p-4 text-center text-gray-400"
                                >
                                    No hay órdenes cargadas
                                </td>
                            </tr>
                        )}

                        {ordenes.map((orden) => (
                            <tr
                                key={orden.id}
                                className="border-b border-gray-800"
                            >
                                <td className="p-2">
                                    {orden.fecha
                                        ? new Date(
                                              orden.fecha
                                          ).toLocaleDateString()
                                        : "-"}
                                </td>

                                <td className="p-2">
                                    {orden.comprobante_numero || "-"}
                                </td>

                                <td className="p-2">
                                    {orden.cliente
                                        ? `${orden.cliente.nombre} ${
                                              orden.cliente.apellido || ""
                                          }`
                                        : "-"}
                                </td>

                                <td className="p-2">{orden.patente}</td>

                                <td className="p-2">
                                    {orden.pagos?.length
                                        ? orden.pagos
                                              .map((p) => p.metodo_pago)
                                              .join(", ")
                                        : "—"}
                                </td>

                                <td className="p-2">$ {orden.total}</td>
                                <td className="p-2">$ {orden.total_pagado}</td>
                                <td className="p-2">$ {orden.saldo}</td>

                                <td className="p-2">
                                    {(() => {
                                        const estado = getEstadoVisual(orden);
                                        return (
                                            <span
                                                className={`px-2 py-1 rounded text-sm text-white ${estado.className}`}
                                            >
                                                {estado.label}
                                            </span>
                                        );
                                    })()}
                                </td>

                                <td className="p-2">
                                    <Link
                                        to={`/ordenes/${orden.id}`}
                                        className="text-blue-400 hover:underline"
                                    >
                                        Ver
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </MainLayout>
    );
}
