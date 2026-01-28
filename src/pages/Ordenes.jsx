import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getOrdenesTrabajo } from "../services/api";

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [search, setSearch] = useState("");

  const fetchOrdenes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOrdenesTrabajo();
      // Manejo de la estructura de datos de Directus
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
  }, []);

  useEffect(() => {
    fetchOrdenes();
  }, [location.state, fetchOrdenes]);

  // Lógica de estados mejorada para incluir ANULADOS
  const getEstadoVisual = (orden) => {
    if (orden.estado === "anulado") {
      return { label: "Anulado", className: "bg-red-500 font-bold" };
    }

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
    const estado = getEstadoVisual(orden);

    return (
      orden.comprobante?.toString().includes(texto) ||
      orden.patente?.toLowerCase().includes(texto) ||
      orden.cliente?.nombre?.toLowerCase().includes(texto) ||
      orden.cliente?.apellido?.toLowerCase().includes(texto) ||
      estado.label.toLowerCase().includes(texto)
    );
  });

  if (loading) {
    return (
      <MainLayout>
        <p className="p-4 text-gray-400">Cargando órdenes...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Órdenes</h1>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por cliente, patente, comprobante o estado..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:max-w-md p-2 rounded bg-gray-800 border border-gray-700 text-white"
        />
      </div>

      {/* ================= MOBILE: CARDS ================= */}
      <div className="space-y-4 md:hidden">
        {ordenesFiltradas.length === 0 && (
          <p className="text-center text-gray-400 py-10">No se encontraron órdenes</p>
        )}

        {ordenesFiltradas.map((orden) => {
          const estado = getEstadoVisual(orden);
          const esAnulada = orden.estado === "anulado";

          return (
            <div
              key={orden.id}
              className={`bg-gray-800 rounded-lg p-4 shadow border-l-4 ${
                esAnulada ? "border-red-500 opacity-60" : "border-blue-500"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-400">
                  {orden.fecha ? new Date(orden.fecha).toLocaleDateString() : "-"}
                </span>
                <span className={`px-2 py-1 rounded text-xs text-white ${estado.className}`}>
                  {estado.label}
                </span>
              </div>

              <p className="font-semibold text-lg">
                {orden.cliente
                  ? `${orden.cliente.nombre} ${orden.cliente.apellido || ""}`
                  : "Cliente -"}
              </p>
              <p className="text-sm text-gray-400">Patente: {orden.patente || "-"}</p>
              <p className="text-sm text-gray-400">Comprobante: {orden.comprobante || "-"}</p>

              <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center">
                <div>
                  <span className="text-xs text-gray-400 block">Total</span>
                  <p className="font-bold">{formatMoney(orden.total)}</p>
                </div>
                <Link
                  to={`/ordenes/${orden.id}`}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-semibold transition"
                >
                  Ver orden
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= DESKTOP / TABLET: TABLA ================= */}
      <div className="hidden md:block overflow-x-auto bg-gray-800 rounded-lg shadow">
        <table className="min-w-[900px] w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-700 text-left bg-gray-900/50">
              <th className="p-3 text-gray-400 font-medium">Fecha</th>
              <th className="p-3 text-gray-400 font-medium">Comprobante</th>
              <th className="p-3 text-gray-400 font-medium">Cliente</th>
              <th className="p-3 text-gray-400 font-medium">Patente</th>
              <th className="p-3 text-gray-400 font-medium">Método pago</th>
              <th className="p-3 text-gray-400 font-medium">Total</th>
              <th className="p-3 text-gray-400 font-medium">Estado</th>
              <th className="p-3 text-gray-400 font-medium text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {ordenesFiltradas.map((orden) => {
              const estado = getEstadoVisual(orden);
              const esAnulada = orden.estado === "anulado";

              return (
                <tr 
                  key={orden.id} 
                  className={`border-b border-gray-700/50 hover:bg-gray-750 transition-colors ${
                    esAnulada ? "bg-red-900/10 opacity-70" : ""
                  }`}
                >
                  <td className="p-3">
                    {orden.fecha ? new Date(orden.fecha).toLocaleDateString() : "-"}
                  </td>
                  <td className="p-3 font-mono text-sm">{orden.comprobante || "-"}</td>
                  <td className="p-3">
                    {orden.cliente
                      ? `${orden.cliente.nombre} ${orden.cliente.apellido || ""}`
                      : "-"}
                  </td>
                  <td className="p-3 uppercase">{orden.patente}</td>
                  <td className="p-3 text-sm">
                    {esAnulada ? (
                      <span className="text-red-400 italic">ANULADA</span>
                    ) : (
                      orden.pagos?.length
                        ? orden.pagos.map((p) => p.metodo_pago).join(", ")
                        : "—"
                    )}
                  </td>
                  <td className="p-3 font-semibold">{formatMoney(orden.total)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs text-white ${estado.className}`}>
                      {estado.label}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <Link
                      to={`/ordenes/${orden.id}`}
                      className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {ordenesFiltradas.length === 0 && (
          <div className="p-10 text-center text-gray-400">No se encontraron resultados</div>
        )}
      </div>
    </MainLayout>
  );
}