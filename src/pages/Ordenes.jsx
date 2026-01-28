import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getOrdenesTrabajo } from "../services/api";

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [search, setSearch] = useState("");

  // --- NUEVOS FILTROS DE FECHA ---
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
      minimumFractionDigits: 2,
    }).format(Number(value) || 0);

  // --- LÓGICA DE FILTRADO COMBINADA ---
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

  // --- CÁLCULOS DE CAJA (PARA RESUMEN E IMPRESIÓN) ---
  const oActivas = ordenesFiltradas.filter(o => o.estado !== "anulado" && o.estado !== "anulada");
  
  const totalFacturado = oActivas.reduce((acc, o) => acc + Number(o.total || 0), 0);
  const totalSaldoPendiente = oActivas.reduce((acc, o) => acc + Number(o.saldo || 0), 0);
  const totalCobradoEfectivo = totalFacturado - totalSaldoPendiente;

  // Desglose por modalidad de pago (buscando dentro de orden.pagos)
  const desglosePagos = oActivas.reduce((acc, o) => {
    o.pagos?.forEach(p => {
      const metodo = p.metodo_pago || "No Especificado";
      acc[metodo] = (acc[metodo] || 0) + Number(p.monto || 0);
    });
    return acc;
  }, {});

  if (loading) {
    return (
      <MainLayout><p className="p-4 text-gray-400">Cargando órdenes...</p></MainLayout>
    );
  }

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
          <button 
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold transition text-sm"
          >
            IMPRIMIR REPORTE
          </button>
        </div>

        {/* FILTROS FECHAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Buscar texto</label>
            <input
              type="text"
              placeholder="Cliente, patente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Fecha Desde</label>
            <input
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Fecha Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white text-sm"
            />
          </div>
        </div>

        {/* RESUMEN RÁPIDO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-900/20 p-4 rounded border border-blue-500/30">
            <span className="text-xs text-blue-400 uppercase">Facturación Total</span>
            <p className="text-xl font-bold">{formatMoney(totalFacturado)}</p>
          </div>
          <div className="bg-green-900/20 p-4 rounded border border-green-500/30">
            <span className="text-xs text-green-400 uppercase">Total Cobrado</span>
            <p className="text-xl font-bold">{formatMoney(totalCobradoEfectivo)}</p>
          </div>
          <div className="bg-red-900/20 p-4 rounded border border-red-500/30">
            <span className="text-xs text-red-400 uppercase">En Cuenta Corriente</span>
            <p className="text-xl font-bold">{formatMoney(totalSaldoPendiente)}</p>
          </div>
        </div>
      </div>

      {/* VISTA IMPRESIÓN (SOLO TOTALES Y TABLA) */}
      <div className="print-only">
        <h1 style={{ textAlign: 'center', margin: 0 }}>GOMERÍA LA SOMBRA</h1>
        <p style={{ textAlign: 'center', fontSize: '12px' }}>Cierre de Caja Detallado</p>
        <p style={{ fontSize: '10px' }}>Filtro: {fechaDesde || 'Inicio'} al {fechaHasta || 'Hoy'}</p>
        
        <div style={{ margin: '15px 0', border: '1px solid black', padding: '10px' }}>
          <p><b>RESUMEN:</b></p>
          <p>Total Facturado: {formatMoney(totalFacturado)}</p>
          <p>Total Cobrado: {formatMoney(totalCobradoEfectivo)}</p>
          <p>Total Pendiente (Cta Cte): {formatMoney(totalSaldoPendiente)}</p>
          <hr />
          <p><b>COBROS POR MEDIO:</b></p>
          {Object.entries(desglosePagos).map(([met, mon]) => (
            <p key={met}>{met.replace(/_/g, ' ').toUpperCase()}: {formatMoney(mon)}</p>
          ))}
        </div>
      </div>

      {/* TABLA PRINCIPAL (VISIBLE EN AMBOS) */}
      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
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
              <th className="p-3 text-gray-400 font-medium text-center no-print">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenesFiltradas.map((orden) => {
              const estado = getEstadoVisual(orden);
              const esAnulada = orden.estado === "anulado";
              return (
                <tr key={orden.id} className={`border-b border-gray-700/50 hover:bg-gray-750 transition-colors ${esAnulada ? "bg-red-900/10 opacity-70" : ""}`}>
                  <td className="p-3">{orden.fecha ? orden.fecha.split("T")[0] : "-"}</td>
                  <td className="p-3 font-mono text-sm">{orden.comprobante || "-"}</td>
                  <td className="p-3 font-bold">
                    {orden.cliente ? `${orden.cliente.nombre} ${orden.cliente.apellido || ""}` : "-"}
                  </td>
                  <td className="p-3 uppercase">{orden.patente}</td>
                  <td className="p-3 text-sm">
                    {esAnulada ? <span className="text-red-400 italic">ANULADA</span> : (
                      orden.pagos?.length ? orden.pagos.map(p => p.metodo_pago).join(", ") : "—"
                    )}
                  </td>
                  <td className="p-3 font-semibold">{formatMoney(orden.total)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-[10px] text-white uppercase ${estado.className}`}>
                      {estado.label}
                    </span>
                  </td>
                  <td className="p-3 text-center no-print">
                    <Link to={`/ordenes/${orden.id}`} className="text-blue-400 hover:text-blue-300 font-medium">Ver</Link>
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