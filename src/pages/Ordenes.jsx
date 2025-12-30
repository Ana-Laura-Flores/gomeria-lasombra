import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getOrdenesTrabajo, getPagos } from "../services/api";

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordenesRes, pagosRes] = await Promise.all([
        getOrdenesTrabajo(),
        getPagos(), // endpoint que devuelve todos los pagos
      ]);

      const ordenesData = Array.isArray(ordenesRes.data)
        ? ordenesRes.data
        : Array.isArray(ordenesRes.data?.data)
        ? ordenesRes.data.data
        : [];

      const pagosData = Array.isArray(pagosRes.data)
        ? pagosRes.data
        : Array.isArray(pagosRes.data?.data)
        ? pagosRes.data.data
        : [];

      setPagos(pagosData);

      // Recalculamos total_pagado y saldo por orden
      const ordenesConPagos = ordenesData.map((orden) => {
        const totalOrden = Number(orden.total || 0);

        // 1️⃣ Pagos asociados directamente a la orden
        const pagosOrden = pagosData.filter(
          (p) => p.orden === orden.id && p.estado === "confirmado"
        );
        const totalPagosOrden = pagosOrden.reduce(
          (sum, p) => sum + Number(p.monto || 0),
          0
        );

        // 2️⃣ Pagos de cta cte del cliente (sin orden)
        const pagosCtaCte = pagosData
          .filter(
            (p) =>
              !p.orden &&
              p.cliente === orden.cliente &&
              p.estado === "confirmado"
          )
          .reduce((sum, p) => sum + Number(p.monto || 0), 0);

        const total_pagado = totalPagosOrden + pagosCtaCte;
        const saldo = Math.max(0, totalOrden - total_pagado);

        return {
          ...orden,
          total_pagado,
          saldo,
        };
      });

      setOrdenes(ordenesConPagos);
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [location.state, fetchData]);

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

  const formatMoney = (value) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(Number(value) || 0);

  const ordenesFiltradas = ordenes.filter((orden) => {
    const texto = search.toLowerCase();
    return (
      orden.comprobante?.toString().includes(texto) ||
      orden.patente?.toLowerCase().includes(texto) ||
      orden.cliente?.nombre?.toLowerCase().includes(texto) ||
      orden.cliente?.apellido?.toLowerCase().includes(texto) ||
      getEstadoVisual(orden).label.toLowerCase().includes(texto)
    );
  });

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-6">Órdenes</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por cliente, patente, comprobante o estado..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:max-w-md p-2 rounded bg-gray-800 border border-gray-700"
        />
      </div>

      {/* ================= MOBILE: CARDS ================= */}
      <div className="space-y-4 md:hidden">
        {ordenesFiltradas.length === 0 && (
          <p className="text-center text-gray-400">No hay órdenes cargadas</p>
        )}

        {ordenesFiltradas.map((orden) => {
          const estado = getEstadoVisual(orden);

          return (
            <div key={orden.id} className="bg-gray-800 rounded-lg p-4 shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">
                  {orden.fecha
                    ? new Date(orden.fecha).toLocaleDateString()
                    : "-"}
                </span>

                <span
                  className={`px-2 py-1 rounded text-xs text-white ${estado.className}`}
                >
                  {estado.label}
                </span>
              </div>

              <p className="font-semibold">
                {orden.cliente
                  ? `${orden.cliente.nombre} ${orden.cliente.apellido || ""}`
                  : "Cliente -"}
              </p>

              <p className="text-sm text-gray-400">Patente: {orden.patente || "-"}</p>

              <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                <div>
                  <span className="text-gray-400">Total</span>
                  <p>{formatMoney(orden.total)}</p>
                </div>

                <div>
                  <span className="text-gray-400">Pagado</span>
                  <p>{formatMoney(orden.total_pagado)}</p>
                </div>

                <div>
                  <span className="text-gray-400">Saldo</span>
                  <p>{formatMoney(orden.saldo)}</p>
                </div>

                <div>
                  <span className="text-gray-400">Pago</span>
                  <p className="truncate">
                    {orden.pagos?.length
                      ? orden.pagos.map((p) => p.metodo_pago).join(", ")
                      : "—"}
                  </p>
                </div>
              </div>

              <Link
                to={`/ordenes/${orden.id}`}
                className="block mt-4 text-center bg-blue-600 py-2 rounded font-semibold"
              >
                Ver orden
              </Link>
            </div>
          );
        })}
      </div>

      {/* ================= DESKTOP / TABLET: TABLA ================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-[900px] w-full border-collapse">
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
            {ordenesFiltradas.map((orden) => {
              const estado = getEstadoVisual(orden);

              return (
                <tr key={orden.id} className="border-b border-gray-800">
                  <td className="p-2">
                    {orden.fecha
                      ? new Date(orden.fecha).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-2">{orden.comprobante || "-"}</td>
                  <td className="p-2">
                    {orden.cliente
                      ? `${orden.cliente.nombre} ${orden.cliente.apellido || ""}`
                      : "-"}
                  </td>
                  <td className="p-2">{orden.patente}</td>
                  <td className="p-2">
                    {orden.pagos?.length
                      ? orden.pagos.map((p) => p.metodo_pago).join(", ")
                      : "—"}
                  </td>
                  <td className="p-2">{formatMoney(orden.total)}</td>
                  <td className="p-2">{formatMoney(orden.total_pagado)}</td>
                  <td className="p-2">{formatMoney(orden.saldo)}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-sm text-white ${estado.className}`}
                    >
                      {estado.label}
                    </span>
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
              );
            })}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}
