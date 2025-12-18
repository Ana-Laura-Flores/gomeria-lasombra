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

  const clientesCC = useMemo(() => {
    const acc = {};
    ordenes.forEach(o => {
      if (!acc[o.cliente_id]) acc[o.cliente_id] = { id: o.cliente_id, nombre: o.cliente_nombre, total: 0, pagado: 0, saldo: 0, ordenes: [] };
      acc[o.cliente_id].total += Number(o.total);
      acc[o.cliente_id].pagado += Number(o.total_pagado);
      acc[o.cliente_id].saldo += Number(o.saldo);
      acc[o.cliente_id].ordenes.push(o);
    });
    return Object.values(acc);
  }, [ordenes]);

  const clientesFiltrados = filtroDeuda ? clientesCC.filter(c => c.saldo > 0) : clientesCC;

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
        <input type="checkbox" checked={filtroDeuda} onChange={e => setFiltroDeuda(e.target.checked)} className="accent-blue-600"/>
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
                <td><button className="bg-blue-600 px-2 py-1 rounded" onClick={() => setDetalleCliente(c)}>Ver órdenes</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detalleCliente && (
        <Modal onClose={() => setDetalleCliente(null)}>
          <h2 className="text-xl font-bold mb-4">Órdenes de {detalleCliente.nombre}</h2>
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
