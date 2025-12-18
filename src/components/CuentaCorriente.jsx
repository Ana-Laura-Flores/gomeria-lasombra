import { useState, useEffect, useMemo } from "react";
import MainLayout from "../layouts/MainLayout";
import Modal from "../components/Modal";
import { getCuentaCorriente } from "../services/api";

export default function CuentaCorriente() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroDeuda, setFiltroDeuda] = useState(false);
  const [detalleCliente, setDetalleCliente] = useState(null);

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

  // Agrupar órdenes por cliente y calcular totales
  const clientesCC = useMemo(() => {
    const acc = {};
    ordenes.forEach(o => {
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
  }, [ordenes]);

  // Aplicar filtro de deuda si está activo
  const clientesFiltrados = filtroDeuda
    ? clientesCC.filter(c => c.saldo > 0)
    : clientesCC;

  const formatMoney = (value) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(Number(value) || 0);

  if (loading) return <MainLayout><p>Cargando cuenta corriente...</p></MainLayout>;

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">Cuenta Corriente de Clientes</h1>

      <label className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={filtroDeuda}
          onChange={e => setFiltroDeuda(e.target.checked)}
          className="accent-blue-600"
        />
        Mostrar solo clientes con deuda
      </label>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 text-gray-100 border border-gray-700">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Total facturado</th>
              <th>Pagado</th>
              <th>Saldo pendiente</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map(c => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{formatMoney(c.total)}</td>
                <td>{formatMoney(c.pagado)}</td>
                <td>{formatMoney(c.saldo)}</td>
                <td>
                  <button
                    className="bg-blue-600 px-2 py-1 rounded"
                    onClick={() => setDetalleCliente(c)}
                  >
                    Ver órdenes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detalleCliente && (
        <Modal onClose={() => setDetalleCliente(null)}>
          <h2 className="text-xl font-bold mb-4">
            Órdenes de {detalleCliente.nombre}
          </h2>
          <table className="min-w-full bg-gray-900 text-gray-100">
            <thead>
              <tr>
                <th>ID</th>
                <th>Total</th>
                <th>Pagado</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {detalleCliente.ordenes.map(o => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{formatMoney(o.total)}</td>
                  <td>{formatMoney(o.total_pagado)}</td>
                  <td>{formatMoney(o.saldo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}
    </MainLayout>
  );
}
