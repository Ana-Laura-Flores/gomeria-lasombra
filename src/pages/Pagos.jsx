import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getOrdenTrabajoById, getPagosByOrden, crearPago } from "../services/api";
import Modal from "../components/Modal";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(Number(value) || 0);

export default function Pagos() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ordenId = searchParams.get("orden");

  const [orden, setOrden] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);

  // Pago temporal antes de enviar
  const [pagoActual, setPagoActual] = useState({
    metodo: "",
    monto: "",
    banco: "",
    numero_cheque: "",
    fecha_cobro: "",
  });

  // =========================
  // Cargar orden y pagos
  // =========================
  const fetchData = async () => {
    if (!ordenId) return;
    setLoading(true);
    try {
      const [ordenRes, pagosRes] = await Promise.all([
        getOrdenTrabajoById(ordenId),
        getPagosByOrden(ordenId),
      ]);
      setOrden(ordenRes.data);
      setPagos(pagosRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [ordenId]);

  if (loading) return <MainLayout><p>Cargando pagos...</p></MainLayout>;
  if (!orden) return <MainLayout><p className="text-red-400">Orden no encontrada</p></MainLayout>;

  const totalPagado = pagos.reduce((acc, p) => acc + Number(p.monto || 0), 0);
  const saldo = Math.max(Number(orden.total) - totalPagado, 0);

  // =========================
  // Agregar pago
  // =========================
  const handleAgregarPago = async () => {
    if (!pagoActual.metodo || !pagoActual.monto) return alert("Completa método y monto");

    try {
      const res = await crearPago({
        cliente: orden.cliente.id,
        orden: orden.id,
        metodo_pago: pagoActual.metodo,
        monto: Number(pagoActual.monto),
        banco: pagoActual.banco || null,
        numero_cheque: pagoActual.numero_cheque || null,
        fecha_cobro: pagoActual.fecha_cobro || null,
      });

      setPagoActual({ metodo: "", monto: "", banco: "", numero_cheque: "", fecha_cobro: "" });

      // Refrescar tabla y mostrar modal
      setPagos((prev) => [...prev, res.data]);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      alert("Error al registrar pago");
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto bg-gray-900 p-6 rounded-lg space-y-6">

        {/* HEADER ORDEN */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <p className="font-semibold">Cliente</p>
            <p>{orden.cliente ? `${orden.cliente.nombre} ${orden.cliente.apellido || ""}` : "-"}</p>
          </div>
          <div>
            <p className="font-semibold">Total</p>
            <p>{formatMoney(orden.total)}</p>
          </div>
          <div>
            <p className="font-semibold">Pagado</p>
            <p>{formatMoney(totalPagado)}</p>
          </div>
          <div>
            <p className="font-semibold">Saldo</p>
            <p className="text-red-400 font-bold">{formatMoney(saldo)}</p>
          </div>
        </div>

        {/* FORMULARIO PAGOS */}
        {saldo > 0 && (
          <div className="bg-gray-800 p-4 rounded space-y-4">
            <h2 className="text-lg font-semibold">Registrar pago</h2>

            <select
              value={pagoActual.metodo}
              onChange={(e) => setPagoActual({ ...pagoActual, metodo: e.target.value })}
              className="w-full p-2 bg-gray-700 rounded"
            >
              <option value="">Método de pago</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="cheque">Cheque</option>
            </select>

            <input
              type="number"
              placeholder="Monto"
              value={pagoActual.monto}
              onChange={(e) => setPagoActual({ ...pagoActual, monto: e.target.value })}
              className="w-full p-2 bg-gray-700 rounded"
            />

            {pagoActual.metodo === "cheque" && (
              <div className="space-y-2">
                <input
                  placeholder="Banco"
                  value={pagoActual.banco}
                  onChange={(e) => setPagoActual({ ...pagoActual, banco: e.target.value })}
                  className="w-full p-2 bg-gray-700 rounded"
                />
                <input
                  placeholder="Número de cheque"
                  value={pagoActual.numero_cheque}
                  onChange={(e) => setPagoActual({ ...pagoActual, numero_cheque: e.target.value })}
                  className="w-full p-2 bg-gray-700 rounded"
                />
                <input
                  type="date"
                  value={pagoActual.fecha_cobro}
                  onChange={(e) => setPagoActual({ ...pagoActual, fecha_cobro: e.target.value })}
                  className="w-full p-2 bg-gray-700 rounded"
                />
              </div>
            )}

            <button
              onClick={handleAgregarPago}
              className="bg-green-600 w-full py-2 rounded"
            >
              Registrar pago
            </button>
          </div>
        )}

        {/* TABLA DE PAGOS */}
        <div className="bg-gray-800 p-4 rounded space-y-2">
          <h2 className="text-lg font-semibold">Pagos realizados</h2>
          {pagos.length === 0 ? (
            <p>No hay pagos registrados</p>
          ) : (
            <div className="space-y-2">
              {pagos.map((p) => (
                <div key={p.id} className="bg-gray-700 p-2 rounded flex justify-between">
                  <span>{p.metodo_pago} – {formatMoney(p.monto)}</span>
                  <span>{new Date(p.fecha).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => navigate(`/ordenes/${orden.id}`)}
          className="px-4 py-2 bg-gray-700 rounded"
        >
          Volver a la orden
        </button>
      </div>

      {/* MODAL CONFIRMACIÓN */}
      <Modal
        open={showModal}
        title="Pago registrado"
        onClose={() => setShowModal(false)}
      >
        <p>El pago se registró correctamente ✅</p>
      </Modal>
    </MainLayout>
  );
}
