import { useState, useEffect, useMemo } from "react";
import MainLayout from "../layouts/MainLayout";
import { getCuentaCorriente } from "../services/api";
import CuentaCorrienteTable from "../components/CuentaCorrienteTable";
import CuentaCorrienteModal from "../components/CuentaCorrienteModal";
import Filters from "../components/Filters";

export default function CuentaCorrientePage() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalleCliente, setDetalleCliente] = useState(null);
  const [filtroDeuda, setFiltroDeuda] = useState(false);
  const [searchNombre, setSearchNombre] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCuentaCorriente();
        setOrdenes(res.data || []);
      } catch (error) {
        console.error("Error cargando cuenta corriente:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Agrupar por cliente y calcular totales
  const clientesCC = useMemo(() => {
    const acc = {};
    ordenes.forEach(o => {
      if (o.condicion_cobro !== "cuenta_corriente") return;
      // Filtrado por fechas
      if (
        (fechaDesde && new Date(o.fecha) < new Date(fechaDesde)) ||
        (fechaHasta && new Date(o.fecha) > new Date(fechaHasta))
      ) return;

      const id = o.cliente.id;
      if (!acc[id]) {
        acc[id] = {
          id,
          nombre: o.cliente.nombre,
          total: 0,
          pagado: 0,
          saldo: 0,
          ordenes: []
        };
      }
      acc[id].total += Number(o.total);
      acc[id].pagado += Number(o.total_pagado);
      acc[id].saldo += Number(o.saldo);
      acc[id].ordenes.push(o);
    });
    return Object.values(acc);
  }, [ordenes, fechaDesde, fechaHasta]);

  // Aplicar filtro deuda
  const clientesFiltrados = useMemo(() => {
    let res = filtroDeuda ? clientesCC.filter(c => c.saldo > 0) : clientesCC;
    if (searchNombre) {
      res = res.filter(c => c.nombre.toLowerCase().includes(searchNombre.toLowerCase()));
    }
    return res.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [clientesCC, filtroDeuda, searchNombre]);

  if (loading) return <MainLayout><p>Cargando cuenta corriente...</p></MainLayout>;

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">Cuenta Corriente de Clientes</h1>

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

      <CuentaCorrienteTable
        clientes={clientesFiltrados}
        onVerDetalle={setDetalleCliente}
      />

      {detalleCliente && (
        <CuentaCorrienteModal cliente={detalleCliente} onClose={() => setDetalleCliente(null)} />
      )}
    </MainLayout>
  );
}
