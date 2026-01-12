import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getOrdenTrabajoById } from "../services/api";

import logo from "../assets/logo.jpg";
import OrdenPrint from "../components/OrdenPrint";
import { exportarPDFOrden } from "../utils/exportarPDFOrden";

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

    const fetchOrden = async () => {
        try {
            setLoading(true);
            const res = await getOrdenTrabajoById(id);
            setOrden(res.data || null);
        } catch (error) {
            console.error("Error cargando orden:", error);
            setOrden(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchOrden = async () => {
            try {
                setLoading(true);
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
        exportarPDFOrden({
            elementId: "orden-print",
            filename: `orden-${orden.id}.pdf`,
        });
    };

    return (
    <MainLayout>
      {/* CONTENEDOR IMPRIMIBLE */}
      <div className="max-w-4xl mx-auto bg-gray-900 p-6 rounded-lg">
        {/* ===== HEADER ===== */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          {/* Logo + título */}
          <div className="flex items-center gap-4">
            <img src={logo} alt="Logo" className="h-12 object-contain" />
            <div>
              <h1 className="text-xl font-bold">Gomería La Sombra</h1>
              <p className="text-sm text-gray-400 print:text-gray-600">
                Orden de trabajo
              </p>
            </div>
          </div>

          {/* Fecha + Comprobante */}
          <div className="text-left md:text-right mt-2 md:mt-0">
            <p>
              <strong>Fecha:</strong>{" "}
              {new Date(orden.fecha).toLocaleDateString()}
            </p>
            <p>
              <strong>Comprobante:</strong> {orden.comprobante || "-"}
            </p>
          </div>
        </div>

        {/* ===== DATOS DEL CLIENTE ===== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-800 p-4 rounded-lg">
          <div>
            <p className="font-semibold">Cliente</p>
            <p>
              {orden.cliente
                ? `${orden.cliente.nombre} ${orden.cliente.apellido || ""}`
                : "-"}
            </p>
          </div>

          <div>
            <p className="font-semibold">Patente</p>
            <p>{orden.patente || "-"}</p>
          </div>

          <div>
            <p className="font-semibold">Condición de cobro</p>
            <span
              className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold
                ${
                  orden.condicion_cobro === "contado"
                    ? "bg-green-600 text-white"
                    : "bg-yellow-500 text-gray-900"
                }
              `}
            >
              {orden.condicion_cobro === "contado"
                ? "Contado"
                : "Cuenta corriente"}
            </span>
          </div>

          <div>
            <p className="font-semibold">Estado</p>
            <p className="capitalize">{orden.estado}</p>
          </div>
        </div>

        {/* ===== ITEMS ===== */}
        <table className="w-full table-auto border-collapse mb-6 text-sm">
          <thead>
            <tr className="border-b border-gray-700 print:border-gray-300">
              <th className="px-4 py-2 text-left">Item</th>
              <th className="px-4 py-2 text-right">Cantidad</th>
              <th className="px-4 py-2 text-right">Precio unit.</th>
              <th className="px-4 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(orden.items_orden) &&
              orden.items_orden.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-800 print:border-gray-200"
                >
                  <td className="px-4 py-2">
                    {item.tipo_item === "servicio"
                      ? item.tarifa?.servicio?.nombre
                      : item.producto?.nombre}
                  </td>
                  <td className="px-4 py-2 text-right">{item.cantidad}</td>
                  <td className="px-4 py-2 text-right">
                    {formatMoney(item.precio_unitario)}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {formatMoney(item.subtotal)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* ===== TOTALES ===== */}
        <div className="mt-4 text-right space-y-1 text-lg font-semibold">
          <p>Total: {formatMoney(orden.total)}</p>
          {orden.total_pagado !== undefined && (
            <p>Pagado: {formatMoney(orden.total_pagado)}</p>
          )}
          {orden.saldo !== undefined && (
            <p>Saldo: {formatMoney(orden.saldo)}</p>
          )}
        </div>

        {/* ===== BOTONES ===== */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-3 print:hidden">
          <button
            onClick={() => navigate("/ordenes")}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 w-full md:w-auto"
          >
            Volver
          </button>

          <button
            onClick={() => exportarPDFOrden({ elementId: "orden-print", filename: `orden-${orden.id}.pdf` })}
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 w-full md:w-auto"
          >
            Descargar PDF
          </button>
        </div>
      </div>

      {/* ===== VISTA IMPRESIÓN (OCULTA) ===== */}
      <div
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          visibility: "hidden",
        }}
      >
        <OrdenPrint orden={orden} />
      </div>
    </MainLayout>
);

}
