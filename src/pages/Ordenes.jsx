import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getOrdenesTrabajo } from "../services/api";

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [search, setSearch] = useState("");

  // --- NUEVOS ESTADOS PARA FILTRO DE FECHA ---
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const fetchOrdenes = useCallback(async () => {
    setLoading(true);
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
  }, []);

  useEffect(() => {
    fetchOrdenes();
  }, [location.state, fetchOrdenes]);

  const getEstadoVisual = (orden) => {
    if (orden.estado === "anulado" || orden.estado === "anulada") {
      return { label: "Anulado", className: "bg-red-500 font-bold" };
    }
    const total = Number(orden.total) || 0;
    const saldo = Number(orden.saldo) || 0;
    if (saldo === 0 && total > 0) return { label: "Pagado", className: "bg-green-700" };
    if (saldo > 0 && saldo < total) return { label: "Parcial", className: "bg-yellow-700" };
    return { label: "Debe", className: "bg-red-700" };
  };

  const formatMoney = (value) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(Number(value) || 0);

  // --- LÓGICA DE FILTRADO (BÚSQUEDA + FECHAS) ---
  const ordenesFiltradas = ordenes.filter((orden) => {
    const texto = search.toLowerCase();
    const estado = getEstadoVisual(orden);
    
    // Filtro de texto
    const cumpleTexto = 
      orden.comprobante?.toString().includes(texto) ||
      orden.patente?.toLowerCase().includes(texto) ||
      orden.cliente?.nombre?.toLowerCase().includes(texto) ||
      estado.label.toLowerCase().includes(texto);

    // Filtro de fecha
    const fechaOrden = orden.fecha ? orden.fecha.split("T")[0] : "";
    let cumpleFecha = true;
    if (fechaDesde && fechaOrden < fechaDesde) cumpleFecha = false;
    if (fechaHasta && fechaOrden > fechaHasta) cumpleFecha = false;

    return cumpleTexto && cumpleFecha;
  });

  // --- CÁLCULOS PARA LA CAJA (SOLO NO ANULADAS) ---
  const oActivas = ordenesFiltradas.filter(o => o.estado !== "anulado" && o.estado !== "anulada");
  const totalFacturado = oActivas.reduce((acc, o) => acc + Number(o.total || 0), 0);
  const totalPendiente = oActivas.reduce((acc, o) => acc + Number(o.saldo || 0), 0);
  const totalCobrado = totalFacturado - totalPendiente;

  if (loading) return (
    <MainLayout><p className="p-4 text-gray-400">Cargando órdenes...</p></MainLayout>
  );

  return (
    <MainLayout>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          nav, aside, .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-only { display: block !important; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000 !important; padding: 4px !important; color: black !important; font-size: 10px !important; }
        }
        .print-only { display: none; }
      `}} />

      <div className="no-print">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wider">Gestión de Caja / Órdenes</h1>
          <button 
            onClick={() => window.print()}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold text-sm transition"
          >
            IMPRIMIR REPORTE
          </button>
        </div>

        {/* FILTROS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-800 p-4 rounded-lg">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Buscar</label>
            <input
              type="text"
              placeholder="Patente, cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white text-sm"
            />
          </div>
        </div>

        {/* RESUMEN DE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500">
            <span className="text-gray-400 text-xs uppercase">Total Facturado</span>
            <p className="text-2xl font-black">{formatMoney(totalFacturado)}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-green-500">
            <span className="text-gray-400 text-xs uppercase">Cobrado (Efectivo/Banco)</span>
            <p className="text-2xl font-black">{formatMoney(totalCobrado)}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-red-500">
            <span className="text-gray-400 text-xs uppercase">Pendiente (Cta Cte)</span>
            <p className="text-2xl font-black">{formatMoney(totalPendiente)}</p>
          </div>
        </div>
      </div>

      {/* REPORTE PARA IMPRESIÓN (OCULTO EN PANTALLA) */}
      <div className="print-only text-black">
        <h2 className="text-center text-xl font-bold uppercase border-b-2 border-black mb-4">Gomería La Sombra - Reporte de Caja</h2>
        <div className="flex justify-between mb-4 text-sm">
            <p>Desde: {fechaDesde || 'Inicio'} | Hasta: {fechaHasta || 'Hoy'}</p>
            <p>Total Cobrado: <b>{formatMoney(totalCobrado)}</b></p>
        </div>
      </div>

      {/* TABLA PRINCIPAL */}
      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-700 text-left bg-gray-900/50">
              <th className="p-3 text-gray-400 font-medium">Fecha</th>
              <th className="p-3 text-gray-400 font-medium">Comprobante</th>
              <th className="p-3 text-gray-400 font-medium">Cliente</th>
              <th className="p-3 text-gray-400 font-medium text-center">Patente</th>
              <th className="p-3 text-gray-400 font-medium">Total</th>
              <th className="p-3 text-gray-400 font-medium text-center no-print">Estado</th>
              <th className="p-3 text-gray-400 font-medium text-center no-print">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenesFiltradas.map((orden) => {
              const estado = getEstadoVisual(orden);
              return (
                <tr key={orden.id} className={`border-b border-gray-700/50 hover:bg-gray-750 transition-colors ${orden.estado === "anulado" ? "opacity-40" : ""}`}>
                  <td className="p-3 text-sm">{orden.fecha ? orden.fecha.split("T")[0] : "-"}</td>
                  <td className="p-3 font-mono text-sm">{orden.comprobante || "-"}</td>
                  <td className="p-3 font-bold">
                    {orden.cliente ? `${orden.cliente.nombre} ${orden.cliente.apellido || ""}` : "Consumidor Final"}
                  </td>
                  <td className="p-3 text-center uppercase font-bold">{orden.patente}</td>
                  <td className="p-3 font-semibold">{formatMoney(orden.total)}</td>
                  <td className="p-3 text-center no-print">
                    <span className={`px-2 py-1 rounded text-[10px] uppercase text-white ${estado.className}`}>
                      {estado.label}
                    </span>
                  </td>
                  <td className="p-3 text-center no-print">
                    <Link to={`/ordenes/${orden.id}`} className="text-blue-400 hover:text-blue-300 font-medium text-sm">Ver</Link>
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