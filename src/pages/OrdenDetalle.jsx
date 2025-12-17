import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getOrdenTrabajoById } from "../services/api";
import html2pdf from "html2pdf.js";
import logo from "../assets/logo.jpg";

const formatMoney = (value) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
    }).format(Number(value) || 0);

export default function OrdenDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [orden, setOrden] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrden = async () => {
            try {
                const res = await getOrdenTrabajoById(id);
                setOrden(res.data || null);
            } catch (error) {
                console.error("Error cargando orden:", error);
                setOrden(null);
            } finally {
                setLoading(false);
            }
        };

        fetchOrden();
    }, [id]);

    if (loading) {
        return (
            <MainLayout>
                <p>Cargando orden...</p>
            </MainLayout>
        );
    }

    if (!orden) {
        return (
            <MainLayout>
                <p className="text-red-400">Orden no encontrada</p>
                <button
                    onClick={() => navigate("/ordenes")}
                    className="mt-4 px-4 py-2 bg-blue-600 rounded"
                >
                    Volver
                </button>
            </MainLayout>
        );
    }
    const exportarPDF = () => {
        const element = document.getElementById("orden-print");

        html2pdf()
            .set({
                margin: 5,
                filename: `orden-${orden.id}.pdf`,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: {
                    unit: "mm",
                    format: "a5",
                    orientation: "portrait",
                },
            })
            .from(element)
            .save();
    };
    return (
        <MainLayout>
            {/* CONTENEDOR IMPRIMIBLE */}
            <div
                id="orden-print"
                className="max-w-4xl mx-auto bg-gray-900 p-6 rounded-lg print:bg-white print:text-black"
            >
                {/* HEADER */}
                <div className="flex items-center gap-4">
                    <img
                        src={logo}
                        alt="Logo"
                        className="h-12 object-contain"
                    />

                    <div>
                        <h1 className="text-xl font-bold">
                            Nombre de la Empresa
                        </h1>
                        <p className="text-sm text-gray-400 print:text-gray-600">
                            Orden de trabajo
                        </p>
                    </div>

                    <div className="text-right">
                        <p>
                            <strong>Fecha:</strong>{" "}
                            {new Date(orden.fecha).toLocaleDateString()}
                        </p>
                        <p>
                            <strong>Comprobante:</strong>{" "}
                            {orden.comprobante_numero || "-"}
                        </p>
                    </div>
                </div>

                {/* DATOS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <p className="font-semibold">Cliente</p>
                        <p>
                            {orden.cliente
                                ? `${orden.cliente.nombre} ${
                                      orden.cliente.apellido || ""
                                  }`
                                : "-"}
                        </p>
                    </div>

                    <div>
                        <p className="font-semibold">Patente</p>
                        <p>{orden.patente}</p>
                    </div>

                    <div>
                        <p className="font-semibold">Estado</p>
                        <p className="capitalize">{orden.estado}</p>
                    </div>
                </div>

                {/* ITEMS */}
                <table className="w-full border-collapse mb-6">
                    <thead>
                        <tr className="border-b border-gray-700 print:border-gray-300">
                            <th className="p-2 text-left">Servicio</th>
                            <th className="p-2 text-right">Precio</th>
                        </tr>
                    </thead>
                    <tbody>
  {Array.isArray(orden.items_orden) &&
    typeof orden.items_orden[0] === "object" &&
    orden.items_orden.map((item) => (
      <tr
        key={item.id}
        className="border-b border-gray-800 print:border-gray-200"
      >
        <td className="p-2">
          {item.tarifa?.servicio?.nombre || "-"}
        </td>
        <td className="p-2 text-right">
          {formatMoney(item.subtotal)}
        </td>
      </tr>
    ))}
</tbody>

                </table>

                {/* TOTALES */}
                <div className="text-right space-y-1 text-lg">
                    <p>
                        Total: <strong>{formatMoney(orden.total)}</strong>
                    </p>
                    <p>Pagado: {formatMoney(orden.total_pagado)}</p>
                    <p>Saldo: {formatMoney(orden.saldo)}</p>
                </div>

                {/* ACCIONES */}
                <div className="mt-6 flex gap-4 print:hidden">
                    <button
                        onClick={() => navigate("/ordenes")}
                        className="px-4 py-2 bg-gray-700 rounded"
                    >
                        Volver
                    </button>

                    <button
                        onClick={exportarPDF}
                        className="px-4 py-2 bg-green-600 rounded"
                    >
                        Descargar PDF
                    </button>
                </div>
            </div>
        </MainLayout>
    );
}
