import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getOrdenesTrabajo } from "../services/api";

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const fetchOrdenes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOrdenesTrabajo();
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
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
    // Normalizamos para que no importe si es "Anulado", "anulada" o "ANULADO"
    const est = String(orden.estado || "").toLowerCase().trim();
    if (est === "anulado" || est === "anulada") {
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

  // --- FILTRADO PARA LA TABLA (Mostramos todo lo que coincida con la búsqueda) ---
  const ordenesFiltradas = ordenes.filter((orden) => {
    const texto = search.toLowerCase();
    const estado = getEstadoVisual(orden);
    
    const cumpleTexto = (
      orden.comprobante?.toString().includes(texto) ||
      orden.patente?.toLowerCase().includes(texto) ||
      orden.cliente?.nombre?.toLowerCase().includes(texto) ||
      orden.cliente?.apellido?.toLowerCase().includes(texto) ||
      estado.label.toLowerCase().includes(texto)
    );

    const fechaOrden = orden.fecha ? orden.fecha.split("T")[0] : "";
    let cumpleFecha = true;
    if (fechaDesde && fechaOrden < fechaDesde) cumpleFecha = false;
    if (fechaHasta && fechaOrden > fechaHasta) cumpleFecha = false;

    return cumpleTexto && cumpleFecha;
  });

  // --- CÁLCULOS DE DINERO (Solo sumamos las que NO están anuladas) ---
  const oNoAnuladas = ordenesFiltradas.filter(o => {
    const est = String(o.estado || "").toLowerCase().trim();
    return est !== "anulado" && est !== "anulada";
  });
  
  const totalFacturado = oNoAnuladas.reduce((acc, o) => acc + Number(o.total || 0), 0);
  const totalSaldoPendiente = oNoAnuladas.reduce((acc, o) => acc + Number(o.saldo || 0), 0);
  const totalCobradoEfectivo = totalFacturado - totalSaldoPendiente;

  return (
    <MainLayout>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          nav, aside, .no-print { display: none !important; }
          body { background: white !important; color: black !important; padding: 0; margin: 0; }
          .print-only { display: block !important; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid black !important; padding: 5px; text-align: left; font-size: 10px; color: black !important; }
        }
        .print-only { display: none; }
      `}} />

      <div className="no-print">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Órdenes y Caja</h1>
          <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold text-sm">
            IMPRIMIR REPORTE
          </button>
        </div>

        {/* FILTROS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
          <input type="text" placeholder="Buscar cliente, patente..." value={search} onChange={(e) => setSearch(e.target.value)} className="p-2 rounded bg-gray-900 border border-gray-700 text-white text-sm" />
          <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="p-2 rounded bg-gray-900 border border-gray-700 text-white text-sm" />
          <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="p-2 rounded bg-gray-900 border border-gray-700 text-white text-sm" />
        </div>

        {/* RESUMEN (No incluye anuladas) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-900/20 p-4 rounded border border-blue-500/30">
            <span className="text-xs text-blue-400">VENTAS TOTALES</span>
            <p className="text-xl font-bold">{formatMoney(totalFacturado)}</p>
          </div>
          <div className="bg-green-900/20 p-4 rounded border border-green-500/30">
            <span className="text-xs text-green-400">TOTAL COBRADO</span>
            <p className="text-xl font-bold">{formatMoney(totalCobradoEfectivo)}</p>
          </div>
          <div className="bg-red-900/20 p-4 rounded border border-red-500/30">
            <span className="text-xs text-red-400 uppercase">En Cuenta Corriente</span>
            <p className="text-xl font-bold">{formatMoney(totalSaldoPendiente)}</p>
          </div>
        </div>
      </div>

      <div className="print-only">
        <h1 style={{ textAlign: 'center', margin: 0 }}>GOMERÍA LA SOMBRA</h1>
        <p style={{ textAlign: 'center', fontSize: '10px' }}>Resumen de Caja</p>
        <div style={{ margin: '10px 0', border: '1px solid black', padding: '10px' }}>
          <p>Total Facturado: {formatMoney(totalFacturado)}</p>
          <p>Total Cobrado: {formatMoney(totalCobradoEfectivo)}</p>
          <p>Total Pendiente: {formatMoney(totalSaldoPendiente)}</p>
        </div>
      </div>

      {/* TABLA: AQUÍ SE VEN TODAS, INCLUIDAS ANULADAS */}
      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
        <table className="min-w-[900px] w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-700 text-left bg-gray-900/50 text-gray-400 text-sm">
              <th className="p-3">Fecha</th>
              <th className="p-3">Comprobante</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Método pago</th>
              <th className="p-3">Total</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-center no-print">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenesFiltradas.map((orden) => {
              const estado = getEstadoVisual(orden);
              const esAnulada = estado.label === "Anulado";
              
              const metodoMostrar = esAnulada 
                ? "ANULADA" 
                : (orden.pagos && orden.pagos.length > 0)
                  ? orden.pagos.map(p => p.metodo_pago?.replace(/_/g, ' ').toUpperCase()).join(", ")
                  : "CUENTA CORRIENTE";

              return (
                <tr key={orden.id} className={`border-b border-gray-700/50 transition-colors ${esAnulada ? "bg-red-900/20 opacity-60" : "hover:bg-gray-700"}`}>
                  <td className="p-3 text-sm">{orden.fecha ? orden.fecha.split("T")[0] : "-"}</td>
                  <td className="p-3 font-mono text-sm">{orden.comprobante || "-"}</td>
                  <td className="p-3 font-bold uppercase text-sm">{orden.cliente?.nombre} {orden.cliente?.apellido}</td>
                  <td className={`p-3 text-[10px] font-black ${metodoMostrar === "CUENTA CORRIENTE" ? "text-yellow-500" : (esAnulada ? "text-red-400" : "text-gray-300")}`}>
                    {metodoMostrar}
                  </td>
                  <td className="p-3 text-sm">{formatMoney(orden.total)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-[9px] text-white uppercase font-black ${estado.className}`}>
                      {estado.label}
                    </span>
                  </td>
                  <td className="p-3 text-center no-print">
                    <Link to={`/ordenes/${orden.id}`} className="text-blue-400 text-sm font-bold">VER</Link>
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