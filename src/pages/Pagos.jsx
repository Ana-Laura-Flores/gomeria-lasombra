import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getOrdenTrabajoById, getPagosByOrden } from "../services/api";
import PagosForm from "../components/pagos/PagoForm";
import PagosTable from "../components/pagos/PagosTable";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(Number(value) || 0);

export default function Pagos() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ordenId = searchParams.get("orden");

  const [orden, setOrden] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [ordenRes, pagosRes] = await Promise.all([
        getOrdenTrabajoById(ordenId),
        getPagosByOrden(ordenId),
      ]);

      setOrden(ordenRes.data);
      setPagos(pagosRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ordenId) fetchData();
  }, [ordenId]);

  if (loading) {
    return (
      <MainLayout>
        <p>Cargando pagos...</p>
      </MainLayout>
    );
  }

  if (!orden) {
    return (
      <MainLayout>
        <p className="text-red-400">Orden no encontrada</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto bg-gray-900 p-6 rounded-lg">
        {/* HEADER */}
        <h1 className="text-xl font-bold mb-4">
          Pagos – Orden #{orden.comprobante_numero || orden.id}
        </h1>

        {/* INFO ORDEN */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="font-semibold">Cliente</p>
            <p>
              {orden.cliente
                ? `${orden.cliente.nombre} ${orden.cliente.apellido || ""}`
                : "-"}
            </p>
          </div>

          <div>
            <p className="font-semibold">Total</p>
            <p>{formatMoney(orden.total)}</p>
          </div>

          <div>
            <p className="font-semibold">Pagado</p>
            <p>{formatMoney(orden.total_pagado)}</p>
          </div>

          <div>
            <p className="font-semibold">Saldo</p>
            <p className="text-red-400 font-bold">
              {formatMoney(orden.saldo)}
            </p>
          </div>
        </div>

        {/* FORM */}
        {orden.saldo > 0 && (
          <PagosForm orden={orden} onSuccess={fetchData} />
        )}

        {/* TABLA */}
        <PagosTable pagos={pagos} />

        <div className="mt-6">
          <button
            onClick={() => navigate(`/ordenes/${orden.id}`)}
            className="px-4 py-2 bg-gray-700 rounded"
          >
            Volver a la orden
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
