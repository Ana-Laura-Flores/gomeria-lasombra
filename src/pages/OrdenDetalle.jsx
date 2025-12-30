import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getOrdenTrabajoById, getPagosCuentaCorriente, getOrdenesTrabajo } from "../services/api"; // <-- traemos todas las ordenes del cliente
import { useCalcularSaldoOrden } from "../hooks/useCalcularSaldoOrden";

import logo from "../assets/logo.jpg";
import OrdenPrint from "../components/OrdenPrint";
import { exportarPDFOrden } from "../utils/exportarPDFOrden";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(Number(value) || 0);

export default function OrdenDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [orden, setOrden] = useState(null);
  const [pagosCliente, setPagosCliente] = useState([]);
  const [ordenesCliente, setOrdenesCliente] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        setLoading(true);

        // 1️⃣ Orden actual
        const resOrden = await getOrdenTrabajoById(id);
        const ordenData = resOrden.data || null;
        setOrden(ordenData);

        if (ordenData?.cliente?.id) {
          const clienteId = ordenData.cliente.id;

          // 2️⃣ Todos los pagos del cliente (cuenta corriente)
          const resPagos = await getPagosCuentaCorriente(clienteId);
          setPagosCliente(resPagos.data || []);

          // 3️⃣ Todas las órdenes del cliente (para saber qué pagos ya se aplicaron)
          const resOrdenes = await getOrdenesTrabajo(); 
          const ordenesClienteData = resOrdenes.data?.filter(
            o => o.cliente?.id === clienteId && o.id !== ordenData.id
          ) || [];
          setOrdenesCliente(ordenesClienteData);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
        setOrden(null);
        setPagosCliente([]);
        setOrdenesCliente([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, [id]);

  // 4️⃣ Calcular saldo, total pagado y estado usando el hook
  const { totalPagado, saldo, estado, pagosAplicados } = useCalcularSaldoOrden(
    orden,
    pagosCliente,
    ordenesCliente
  );

  if (loading) {
    return (
      <MainLayout>
        <p>Cargando orden...</p>
      </MainLayout>
    );
  }

  if (!orden) {
    return (
      <MainLayout>
        <p className="text-red-400">Orden no encontrada</p>
        <button
          onClick={() => navigate("/ordenes")}
          className="mt-4 px-4 py-2 bg-blue-600 rounded"
        >
          Volver
        </button>
      </MainLayout>
    );
  }

  const exportarPDF = () => {
    exportarPDFOrden({
      elementId: "orden-print",
      filename: `orden-${orden.id}.pdf`,
    });
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto bg-gray-900 p-6 rounded-lg">
        {/* HEADER */}
        <div className="flex items-center gap-4">
          <img src={logo} alt="Logo" className="h-12 object-contain" />
          <div>
            <h1 className="text-xl font-bold">Gomería La Sombra</h1>
            <p className="text-sm text-gray-400 print:text-gray-600">
              Orden de trabajo
            </p>
          </div>
          <div className="text-right">
            <p>
              <strong>Fecha:</strong>{" "}
              {new Date(orden.fecha).toLocaleDateString()}
            </p>
            <p>
              <strong>Comprobante:</strong> {orden.comprobante || "-"}
            </p>
          </div>
        </div>

        {/* DATOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <p className="font-semibold">Cliente</p>
            <p>
              {orden.cliente
                ? `${orden.cliente.nombre} ${orden.cliente.apellido || ""}`
                : "-"}
            </p>
          </div>
          <div>
            <p className="font-semibold">Patente</p>
            <p>{orden.patente}</p>
          </div>
          <div>
            <p className="font-semibold">Estado</p>
            <p className="capitalize">{estado}</p>
          </div>
        </div>

        {/* ITEMS */}
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="border-b border-gray-700 print:border-gray-300">
              <th className="p-2 text-left">Servicio</th>
              <th className="p-2 text-right">Cantidad</th>
              <th className="p-2 text-right">Precio unit.</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(orden.items_orden) &&
              orden.items_orden.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-800 print:border-gray-200"
                >
                  <td className="p-2">{item.tarifa?.servicio?.nombre || "-"}</td>
                  <td className="p-2 text-right">{item.cantidad}</td>
                  <td className="p-2 text-right">{formatMoney(item.precio_unitario)}</td>
                  <td className="p-2 text-right font-semibold">{formatMoney(item.subtotal)}</td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* TOTALES */}
        <div className="text-right space-y-1 text-lg">
          <p>
            Total: <strong>{formatMoney(orden.total)}</strong>
          </p>
          <p>Pagado: {formatMoney(totalPagado)}</p>
          <p>Saldo: {formatMoney(saldo)}</p>
          <p>Estado: {estado}</p>
        </div>

        {/* ACCIONES */}
        <div className="mt-6 flex items-center justify-between print:hidden">
          <button
            onClick={() => navigate("/ordenes")}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            Volver
          </button>

          <div className="flex gap-3">
            <button
              onClick={exportarPDF}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
            >
              Descargar PDF
            </button>

            {saldo > 0 && (
              <Link
                to={`/pagos/nuevo?orden=${orden.id}`}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                Registrar pago
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* VISTA IMPRESIÓN (OCULTA) */}
      <div
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          visibility: "hidden",
        }}
      >
        <OrdenPrint orden={orden} />
      </div>
    </MainLayout>
  );
}
