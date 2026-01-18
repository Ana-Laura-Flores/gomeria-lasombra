import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Filters from "../components/Filters";
import ClienteModal from "../components/ClienteModal";
import { getOrdenesTrabajo, getPagosConfirmados } from "../services/api";
import ClientesResumenTable from "../components/ClientesResumenTable";

export default function Clientes() {
  const [ordenes, setOrdenes] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clienteDetalleId, setClienteDetalleId] = useState(null);

  // filtros
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

      setOrdenes(resOrdenes.data || []);
      setPagos(resPagos.data || []);
    } catch (err) {
      console.error("Error cargando clientes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [location.key]);

  // ================= AGRUPAR TODO POR CLIENTE =================
  const clientes = useMemo(() => {
    const acc = {};

    // 1. PROCESAR ORDENES (Solo activas)
    ordenes.forEach((o) => {
      // FILTRO DE ANULADAS: Si la orden está anulada, no genera deuda ni suma al total
      const estadoStr = String(o.estado || "").toLowerCase().trim();
      if (estadoStr === 'anulado' || estadoStr === 'anulada' || estadoStr === 'archived') return;

      if (!o.cliente) return;

      const clienteId = o.cliente.id;

      // Filtro de fechas
      if (
        (fechaDesde && new Date(o.fecha) < new Date(fechaDesde)) ||
        (fechaHasta && new Date(o.fecha) > new Date(fechaHasta))
      ) return;

      if (!acc[clienteId]) {
        acc[clienteId] = {
          id: clienteId,
          nombre: o.cliente.nombre,
          total: 0,
          pagado: 0,
          saldo: 0,
          ordenes: [],
          pagos: [],
        };
      }

      const monto = Number(o.total || 0);
      acc[clienteId].total += monto;

      // Si fue contado, se considera pago automático
      if (o.condicion_cobro === "contado") {
        acc[clienteId].pagado += monto;
      }

      acc[clienteId].ordenes.push(o);
    });

    // 2. PROCESAR PAGOS (Solo válidos)
    pagos.forEach((p) => {
      // Ignorar si el pago está anulado o si la orden relacionada está anulada
      const pagoAnulado = p.anulado === true || p.anulado === 1;
      const ordenAsociadaAnulada = p.orden_trabajo?.estado === 'anulado' || p.orden_trabajo?.estado === 'anulada';
      
      if (pagoAnulado || ordenAsociadaAnulada) return;

      const clienteId = p.cliente?.id ?? p.cliente;
      if (!clienteId) return;

      if (!acc[clienteId]) {
        acc[clienteId] = {
          id: clienteId,
          nombre: p.cliente?.nombre || "Cliente",
          total: 0,
          pagado: 0,
          saldo: 0,
          ordenes: [],
          pagos: [],
        };
      }

      acc[clienteId].pagado += Number(p.monto || 0);
      acc[clienteId].pagos.push(p);
    });

    // 3. CALCULAR SALDOS FINALES
    Object.values(acc).forEach((c) => {
      // Redondeamos a 2 decimales para evitar problemas de coma flotante
      c.saldo = Math.round((c.total - c.pagado) * 100) / 100;
    });

    return Object.values(acc);
  }, [ordenes, pagos, fechaDesde, fechaHasta]);

  // ================= FILTROS DE VISTA =================
  const clientesFiltrados = useMemo(() => {
    let res = filtroDeuda
      ? clientes.filter((c) => c.saldo > 0.01) // Margen de 1 centavo para evitar ruidos de redondeo
      : clientes;

    if (searchNombre) {
      res = res.filter((c) =>
        (c.nombre || "").toLowerCase().includes(searchNombre.toLowerCase())
      );
    }

    return res.sort((a, b) =>
      (a.nombre || "").localeCompare(b.nombre || "")
    );
  }, [clientes, filtroDeuda, searchNombre]);

  if (loading)
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-white animate-pulse">Cargando base de datos de clientes...</p>
        </div>
      </MainLayout>
    );

  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Clientes</h1>
        <p className="text-gray-400 text-sm">Resumen de cuentas corrientes y saldos</p>
      </div>

      <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 mb-6">
        <Filters
          filtroDeuda={filtroDeuda}
          setFiltroDeuda={setFiltroDeuda}
          searchNombre={searchNombre}
          setSearchNombre={setSearchNombre}
          fechaDesde={fechaDesde}
          setFechaDesde={setFechaDesde}
          fechaHasta={fechaHasta}
          setFechaHasta={setFechaHasta}
        />
      </div>

      <div className="bg-gray-900/50 rounded-xl border border-gray-800">
        <ClientesResumenTable
          clientes={clientesFiltrados}
          onVerDetalle={(cliente) => setClienteDetalleId(cliente.id)}
        />
      </div>

      {clienteDetalleId && (
        <ClienteModal
          clienteId={clienteDetalleId}
          onClose={() => setClienteDetalleId(null)}
          onPagoRegistrado={() => fetchData()}
        />
      )}
    </MainLayout>
  );
}