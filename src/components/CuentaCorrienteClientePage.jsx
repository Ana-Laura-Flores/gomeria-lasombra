// src/pages/CuentaCorrienteClientePage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import {
  getOrdenesTrabajo,
  getPagosPorMes, // Idealmente reemplazar por getPagosByCliente(cliente.id)
} from "../services/api";
import CuentaCorrienteMovimientos from "../components/CuentaCorrienteMovimientos";
import CuentaCorrientePDF from "../components/CuentaCorrientePDF";
import { exportarPDFOrden } from "../utils/exportarPDFOrden";

export default function CuentaCorrienteClientePage({ cliente }) {
  // cliente = { id, nombre }
  const clienteId = cliente?.id;
  const [ordenes, setOrdenes] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!clienteId) return;
    setLoading(true);
    try {
      // Traer todas las órdenes y pagos
      const [resOrdenes, resPagos] = await Promise.all([
        getOrdenesTrabajo(),
        getPagosPorMes("1900-01-01", "2100-01-01"),
      ]);

      // Filtrar órdenes de cuenta corriente del cliente
      const ordenesCCCliente = resOrdenes.data
        .filter((o) => o.condicion_cobro === "cuenta_corriente")
        .filter((o) => o.cliente && String(o.cliente.id) === String(clienteId));

      // Filtrar pagos confirmados del cliente
      const pagosConfirmadosCliente = resPagos.data
        .filter((p) => p.estado === "confirmado")
        .filter((p) => {
          const id = p.cliente?.id ?? p.cliente; // cliente puede ser objeto o id
          return String(id) === String(clienteId);
        });

      setOrdenes(ordenesCCCliente);
      setPagos(pagosConfirmadosCliente);
    } catch (err) {
      console.error("Error cargando cuenta corriente del cliente:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clienteId]);

  // =========================
  // Resumen
  // =========================
  const resumen = useMemo(() => {
    const total = ordenes.reduce((acc, o) => acc + Number(o.total || 0), 0);
    const pagado = pagos.reduce((acc, p) => acc + Number(p.monto || 0), 0);
    return { total, pagado, saldo: total - pagado };
  }, [ordenes, pagos]);

  // =========================
  // Movimientos
  // =========================
  const movimientos = useMemo(() => {
    const msOrdenes = ordenes.map((o) => ({
      fecha: o.fecha,
      tipo: "ORDEN",
      referencia: (
        <Link
          to={`/ordenes/${o.id}`}
          className="text-blue-400 hover:underline"
        >
          #{o.comprobante || o.id}
        </Link>
      ),
      debe: Number(o.total),
      haber: 0,
    }));

    const msPagos = pagos.map((p) => ({
      fecha: p.fecha,
      tipo: p.metodo_pago === "cheque" ? "CHEQUE" : "PAGO",
      referencia: p.metodo_pago || "Pago",
      debe: 0,
      haber: Number(p.monto),
      banco: p.banco || null,
      numero_cheque: p.numero_cheque || null,
      fecha_cobro: p.fecha_cobro || null,
    }));

    return [...msOrdenes, ...msPagos].sort(
      (a, b) => new Date(a.fecha) - new Date(b.fecha)
    );
  }, [ordenes, pagos]);

  if (loading) {
    return (
      <MainLayout>
        <p>Cargando cuenta corriente del cliente...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          Cuenta Corriente · {cliente?.nombre || clienteId}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() =>
              exportarPDFOrden({
                elementId: "cc-pdf",
                filename: `CuentaCorriente-${cliente?.nombre || clienteId}.pdf`,
              })
            }
            className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
          >
            Exportar PDF
          </button>
          <Link to="/cuenta-corriente" className="px-3 py-1 rounded bg-gray-700">
            Volver
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Resumen label="Total" value={resumen.total} />
        <Resumen label="Pagado" value={resumen.pagado} />
        <Resumen label="Saldo" value={resumen.saldo} saldo />
      </div>

      <CuentaCorrienteMovimientos movimientos={movimientos} />

      {/* Para PDF */}
      <div className="hidden">
        <div id="cc-pdf">
          <CuentaCorrientePDF
            cliente={{ id: clienteId, nombre: cliente?.nombre }}
            movimientos={movimientos}
          />
        </div>
      </div>
    </MainLayout>
  );
}

// =========================
// Resumen
// =========================
function Resumen({ label, value, saldo }) {
  return (
    <div className="bg-gray-800 p-3 rounded text-center">
      <span className="text-gray-400 text-sm">{label}</span>
      <p
        className={`text-lg font-bold ${
          saldo && value > 0 ? "text-red-400" : "text-green-400"
        }`}
      >
        {new Intl.NumberFormat("es-AR", {
          style: "currency",
          currency: "ARS",
        }).format(Number(value) || 0)}
      </p>
    </div>
  );
}
