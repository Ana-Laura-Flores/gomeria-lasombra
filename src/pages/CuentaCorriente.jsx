import { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import Filters from "../components/Filters";
import CuentaCorrienteTable from "../components/CuentaCorrienteTable";
import CuentaCorrienteModal from "../components/CuentaCorrienteModal";
import { getOrdenesTrabajo, getPagosConfirmados } from "../services/api";
import { useLocation } from "react-router-dom";

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

      const ordenesCC = resOrdenes.data.filter(
        (o) => o.condicion_cobro === "cuenta_corriente"
      );

      setOrdenes(ordenesCC);
      setPagos(resPagos.data);
    } catch (err) {
      console.error("Error cargando cuenta corriente:", err);
    } finally {
      setLoading(false);
    }
  };

  // Refrescar si hay cambio en la ubicación
  useEffect(() => {
    fetchData();
  }, [location.key]);

  // ================= AGRUPAR POR CLIENTE =================
  const clientesCC = useMemo(() => {
    const acc = {};

    // ÓRDENES
    ordenes.forEach((o) => {
      if (!o.cliente) return;

      if ((fechaDesde && new Date(o.fecha) < new Date(fechaDesde)) ||
          (fechaHasta && new Date(o.fecha) > new Date(fechaHasta))) return;

      const id = o.cliente.id;
      if (!acc[id]) acc[id] = { id, nombre: o.cliente.nombre, total: 0, pagado: 0, saldo: 0, ordenes: [], pagos: [] };

      acc[id].total += Number(o.total || 0);
      acc[id].ordenes.push(o);
    });

    // PAGOS
    pagos.forEach((p) => {
      const clienteId = p.cliente?.id ?? p.cliente;
      if (!clienteId) return;

      if (!acc[clienteId]) acc[clienteId] = { id: clienteId, nombre: p.cliente?.nombre || "Cliente", total: 0, pagado: 0, saldo: 0, ordenes: [], pagos: [] };

      acc[clienteId].pagado += Number(p.monto || 0);
      acc[clienteId].pagos.push(p);
    });

    Object.values(acc).forEach((c) => {
      c.saldo = c.total - c.pagado;
    });

    return Object.values(acc);
  }, [ordenes, pagos, fechaDesde, fechaHasta]);

  const clientesFiltrados = useMemo(() => {
    let res = filtroDeuda ? clientesCC.filter((c) => c.saldo > 0) : clientesCC;
    if (searchNombre) res = res.filter((c) => c.nombre.toLowerCase().includes(searchNombre.toLowerCase()));
    return res.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
  }, [clientesCC, filtroDeuda, searchNombre]);

  if (loading) return <MainLayout><p>Cargando cuenta corriente...</p></MainLayout>;

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">Cuenta Corriente de Clientes</h1>

      <Filters
        filtroDeuda={filtroDeuda} setFiltroDeuda={setFiltroDeuda}
        searchNombre={searchNombre} setSearchNombre={setSearchNombre}
        fechaDesde={fechaDesde} setFechaDesde={setFechaDesde}
        fechaHasta={fechaHasta} setFechaHasta={setFechaHasta}
      />

      <CuentaCorrienteTable
        clientes={clientesFiltrados}
        onVerDetalle={(cliente) => setClienteDetalleId(cliente.id)}
      />

      {clienteDetalleId && (
        <CuentaCorrienteModal
          key={clienteDetalleId} // IMPORTANTE: usar clienteDetalleId
          clienteId={clienteDetalleId}
          onClose={() => setClienteDetalleId(null)}
          onPagoRegistrado={fetchData} // refresca la tabla principal
        />
      )}
    </MainLayout>
  );
}
