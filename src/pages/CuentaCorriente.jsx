import { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import Filters from "../components/Filters";
import CuentaCorrienteTable from "../components/CuentaCorrienteTable";
import CuentaCorrienteModal from "../components/CuentaCorrienteModal";
import { getOrdenesTrabajo, getPagosConfirmados } from "../services/api";
import { useLocation } from "react-router-dom";

const formatMoney = (val) => 
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(val || 0);

export default function CuentaCorriente() {
  const [ordenes, setOrdenes] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clienteDetalleId, setClienteDetalleId] = useState(null);

  const [filtroDeuda, setFiltroDeuda] = useState(false);
  const [searchNombre, setSearchNombre] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const location = useLocation();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resOrdenes, resPagos] = await Promise.all([
        getOrdenesTrabajo(),
        getPagosConfirmados(),
      ]);
      const ordenesCC = resOrdenes.data.filter((o) => o.condicion_cobro === "cuenta_corriente");
      setOrdenes(ordenesCC);
      setPagos(resPagos.data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [location.key]);

  const clientesCC = useMemo(() => {
    const acc = {};
    ordenes.forEach((o) => {
      if (!o.cliente) return;
      if ((fechaDesde && new Date(o.fecha) < new Date(fechaDesde)) ||
          (fechaHasta && new Date(o.fecha) > new Date(fechaHasta))) return;

      const id = o.cliente.id;
      if (!acc[id]) acc[id] = { id, nombre: o.cliente.nombre, total: 0, pagado: 0, saldo: 0, ordenes: [], pagos: [] };
      acc[id].total += Number(o.total || 0);
      acc[id].ordenes.push(o);
    });

    pagos.forEach((p) => {
      const clienteId = p.cliente?.id ?? p.cliente;
      if (!clienteId || p.estado !== "confirmado") return;
      if (!acc[clienteId]) {
        acc[clienteId] = { id: clienteId, nombre: p.cliente?.nombre || "Cliente", total: 0, pagado: 0, saldo: 0, ordenes: [], pagos: [] };
      }
      p.tipo === "anulacion" ? acc[clienteId].pagado -= Number(p.monto || 0) : acc[clienteId].pagado += Number(p.monto || 0);
      acc[clienteId].pagos.push(p);
    });

    Object.values(acc).forEach((c) => { c.saldo = c.total - c.pagado; });
    return Object.values(acc);
  }, [ordenes, pagos, fechaDesde, fechaHasta]);

  const clientesFiltrados = useMemo(() => {
    let res = filtroDeuda ? clientesCC.filter((c) => c.saldo > 0) : clientesCC;
    if (searchNombre) res = res.filter((c) => c.nombre.toLowerCase().includes(searchNombre.toLowerCase()));
    return res.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
  }, [clientesCC, filtroDeuda, searchNombre]);

  // Totales para las Cards de arriba
  const totalDeudaGlobal = clientesFiltrados.reduce((acc, curr) => acc + curr.saldo, 0);

  if (loading) return <MainLayout><div className="p-10 text-center text-white animate-pulse font-black uppercase tracking-widest">Cargando Cuentas...</div></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 pb-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Cuenta Corriente</h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Gestión de créditos y saldos</p>
          </div>
          
          {/* CARD DE RESUMEN RÁPIDO */}
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-4">
            <div className="bg-red-500 p-3 rounded-xl text-white shadow-lg shadow-red-500/20">
              <span className="text-2xl">💸</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-red-500/70 uppercase tracking-widest">Deuda Total Pendiente</p>
              <p className="text-2xl font-black text-white font-mono">{formatMoney(totalDeudaGlobal)}</p>
            </div>
          </div>
        </div>

        {/* FILTROS (Asegúrate que el componente Filters use clases de Tailwind prolijas) */}
        <div className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 mb-6 backdrop-blur-sm">
          <Filters
            filtroDeuda={filtroDeuda} setFiltroDeuda={setFiltroDeuda}
            searchNombre={searchNombre} setSearchNombre={setSearchNombre}
            fechaDesde={fechaDesde} setFechaDesde={setFechaDesde}
            fechaHasta={fechaHasta} setFechaHasta={setFechaHasta}
          />
        </div>

        {/* TABLA PRINCIPAL */}
        <div className="bg-gray-800/40 rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl">
          <CuentaCorrienteTable
            clientes={clientesFiltrados}
            onVerDetalle={(cliente) => setClienteDetalleId(cliente.id)}
          />
          
          {clientesFiltrados.length === 0 && (
            <div className="p-20 text-center">
              <span className="text-4xl block mb-2">🔎</span>
              <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">No se encontraron clientes</p>
            </div>
          )}
        </div>
      </div>

      {clienteDetalleId && (
        <CuentaCorrienteModal
          clienteId={clienteDetalleId}
          onClose={() => setClienteDetalleId(null)}
          onPagoRegistrado={(nuevosItems) => setPagos((prev) => [...prev, ...nuevosItems])}
        />
      )}
    </MainLayout>
  );
}