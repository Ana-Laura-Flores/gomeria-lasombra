import { useState, useEffect, useMemo } from "react";
import MainLayout from "../layouts/MainLayout";
import Modal from "../components/Modal";
import { getCuentaCorriente, getClientes } from "../services/api";

export default function CuentaCorriente() {
  const [ordenes, setOrdenes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroDeuda, setFiltroDeuda] = useState(false);
  const [detalleCliente, setDetalleCliente] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resOrdenes = await getCuentaCorriente();
        const resClientes = await getClientes();

        setOrdenes(resOrdenes.data || []); // si tu API devuelve directamente un array, usa resOrdenes
        setClientes(resClientes.data || []);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Mapear ID de cliente a su nombre
  const clientesCC = useMemo(() => {
    const acc = {};
    const clientesMap = Object.fromEntries(clientes.map(c => [c.id, c.nombre]));

    ordenes.forEach(o => {
      const clienteId = o.cliente;
      const clienteNombre = clientesMap[clienteId] || "Desconocido";
      if (!acc[clienteId]) acc[clienteId] = { id: clienteId, nombre: clienteNombre, total: 0, pagado: 0, saldo: 0, ordenes: [] };
      acc[clienteId].total += Number(o.total);
      acc[clienteId].pagado += Number(o.total_pagado);
      acc[clienteId].saldo += Number(o.saldo);
      acc[clienteId].ordenes.push(o);
    });

    return Object.values(acc);
  }, [ordenes, clientes]);

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
                <td>
                  <button className="bg-blue-600 px-2 py-1 rounded" onClick={() => setDetalleCliente(c)}>
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
