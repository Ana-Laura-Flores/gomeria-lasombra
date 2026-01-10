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
        getOrdenesTrabajo(),        // 🔹 TODAS las órdenes
        getPagosConfirmados(),      // 🔹 Todos los pagos
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

    // ORDENES (contado + cuenta corriente)
    ordenes.forEach((o) => {
      if (!o.cliente) return;

      const clienteId = o.cliente.id;

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

    // PAGOS
    pagos.forEach((p) => {
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

    Object.values(acc).forEach((c) => {
      c.saldo = c.total - c.pagado;
    });

    return Object.values(acc);
  }, [ordenes, pagos, fechaDesde, fechaHasta]);

  // ================= FILTROS =================
  const clientesFiltrados = useMemo(() => {
    let res = filtroDeuda
      ? clientes.filter((c) => c.saldo > 0)
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
        <p className="p-4">Cargando clientes…</p>
      </MainLayout>
    );

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>

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

      <ClientesResumenTable
        clientes={clientesFiltrados}
        onVerDetalle={(cliente) => setClienteDetalleId(cliente.id)}
      />

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
