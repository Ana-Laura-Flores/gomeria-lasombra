import { useState, useEffect } from "react";
import {
  crearPago,
  getCuentaCorrienteByCliente,
  crearCuentaCorriente,
  generarNumeroRecibo,
  crearAnulacion,
} from "../../services/api";
import { useMetodoPago } from "../../hooks/useMetodoPago";
import Modal from "../Modal"; // Asegurate de tener tu componente Modal

const formatMoney = (v) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(Number(v) || 0);

export default function PagoForm({ cliente, pagosExistentes = [], onPagoRegistrado }) {
  const metodos = useMetodoPago();
  const clienteId = typeof cliente === "object" ? cliente.id : cliente;

  const [cuentaCorriente, setCuentaCorriente] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagos, setPagos] = useState([]);
  const [pagoActual, setPagoActual] = useState({
    metodo: "",
    monto: "",
    banco: "",
    numero_cheque: "",
    fecha_cobro: "",
  });

  // --- Para anular ---
  const [pagoAAnular, setPagoAAnular] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [showAnulacionModal, setShowAnulacionModal] = useState(false);

  // =========================
  // Cargar cuenta corriente
  // =========================
  useEffect(() => {
    if (!clienteId) return;

    const cargarCC = async () => {
      try {
        const res = await getCuentaCorrienteByCliente(clienteId);
        setCuentaCorriente(res?.data?.[0] || null);
      } catch (err) {
        console.error("Error cargando cuenta corriente", err);
      }
    };

    cargarCC();
  }, [clienteId]);

  // =========================
  // Agregar / eliminar pagos locales
  // =========================
  const agregarPago = () => {
    if (!pagoActual.metodo || !pagoActual.monto) return;

    setPagos((prev) => [
      ...prev,
      { ...pagoActual, monto: parseFloat(pagoActual.monto) },
    ]);

    setPagoActual({
      metodo: "",
      monto: "",
      banco: "",
      numero_cheque: "",
      fecha_cobro: "",
    });
  };

  const eliminarPago = (index) => {
    setPagos((prev) => prev.filter((_, i) => i !== index));
  };

  const totalPagosNum = pagos.reduce((acc, p) => acc + Number(p.monto || 0), 0);

  // =========================
  // SUBMIT PAGOS
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pagos.length) return alert("No hay pagos cargados");

    setLoading(true);
    try {
      let cc = cuentaCorriente;

      if (!cc) {
        const res = await crearCuentaCorriente({ cliente: clienteId });
        cc = res?.data || res;
        setCuentaCorriente(cc);
      }

      const pagosGuardados = [];

      for (const pago of pagos) {
        const numero_recibo = await generarNumeroRecibo();
        const res = await crearPago({
          tipo: "pago",
          numero_recibo,
          cliente: String(clienteId),
          metodo_pago: pago.metodo,
          monto: parseFloat(pago.monto),
          banco: pago.banco || null,
          numero_cheque: pago.numero_cheque || null,
          fecha_cobro: pago.fecha_cobro || null,
          cuenta_corriente: cc.id,
          estado: "confirmado",
        });

        pagosGuardados.push({
          ...(res?.data || res),
          fecha: res?.data?.fecha || new Date().toISOString().split("T")[0],
        });
      }

      onPagoRegistrado?.(pagosGuardados);
      setPagos([]);
    } catch (err) {
      console.error(err);
      alert("Error al registrar el pago");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // CONFIRMAR ANULACION
  // =========================
  const handleConfirmarAnulacion = async () => {
    if (!pagoAAnular) return;
    if (!motivo.trim()) return alert("Debes ingresar un motivo de anulación");

    try {
      await crearAnulacion({
        pagoId: pagoAAnular.id,
        clienteId: clienteId,
        monto: pagoAAnular.monto,
        motivo,
      });

      alert(`Pago ${pagoAAnular.numero_recibo || pagoAAnular.id} anulado correctamente`);
      setShowAnulacionModal(false);
      setPagoAAnular(null);
      setMotivo("");
      onPagoRegistrado?.(); // refresca tabla de pagos desde el padre
    } catch (e) {
      console.error(e);
      alert("Error al anular el pago");
    }
  };

  // =========================
  // RENDER
  // =========================
  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded space-y-4">
      <h2 className="text-lg font-semibold">Registrar pago</h2>

      {/* FORM NUEVO PAGO */}
      <select
        value={pagoActual.metodo}
        onChange={(e) => setPagoActual({ ...pagoActual, metodo: e.target.value })}
        className="w-full p-2 bg-gray-700 rounded"
      >
        <option value="">Método de pago</option>
        {metodos.map((m) => (
          <option key={m.value} value={m.value}>{m.text}</option>
        ))}
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
        type="button"
        onClick={agregarPago}
        className="bg-blue-600 w-full py-2 rounded"
      >
        Agregar pago
      </button>

      {pagos.length > 0 && (
        <div className="space-y-2">
          {pagos.map((p, i) => (
            <div key={i} className="bg-gray-700 p-2 rounded flex justify-between">
              <span>{p.metodo} – {formatMoney(p.monto)}</span>
              <button type="button" onClick={() => eliminarPago(i)} className="text-red-400">Quitar</button>
            </div>
          ))}
          <p className="text-right font-semibold">Total: {formatMoney(totalPagosNum)}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 w-full py-2 rounded disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Confirmar pagos"}
      </button>

      {/* ========================= */}
      {/* SELECCIONAR PAGO A ANULAR */}
      {pagosExistentes.length > 0 && (
        <div className="mt-6">
          <label className="block mb-1 font-semibold text-white">Anular pago existente</label>
          <select
            className="w-full p-2 bg-gray-700 rounded"
            value={pagoAAnular?.id || ""}
            onChange={(e) => {
              const pago = pagosExistentes.find((p) => p.id === e.target.value);
              setPagoAAnular(pago || null);
            }}
          >
            <option value="">Seleccionar pago</option>
            {pagosExistentes.map((p) => (
              p.tipo === "pago" && !p.anulado && (
                <option key={p.id} value={p.id}>
                  {p.numero_recibo ? `Recibo #${p.numero_recibo}` : `Pago ${p.id}`} – {formatMoney(p.monto)}
                </option>
              )
            ))}
          </select>

          {pagoAAnular && (
            <button
              type="button"
              className="bg-red-600 w-full py-2 rounded text-white mt-2"
              onClick={() => setShowAnulacionModal(true)}
            >
              Anular pago seleccionado
            </button>
          )}
        </div>
      )}

      {/* ========================= */}
      {/* MODAL ANULACION */}
      <Modal
        open={showAnulacionModal}
        title={`Anular pago ${pagoAAnular?.numero_recibo || pagoAAnular?.id}`}
        onClose={() => setShowAnulacionModal(false)}
        actions={
          <>
            <button onClick={handleConfirmarAnulacion} className="bg-red-600 px-4 py-2 rounded text-white">
              Confirmar Anulación
            </button>
            <button onClick={() => setShowAnulacionModal(false)} className="bg-gray-700 px-4 py-2 rounded">
              Cancelar
            </button>
          </>
        }
      >
        <p>Ingrese el motivo de la anulación:</p>
        <textarea
          className="w-full mt-2 p-2 border rounded bg-gray-800 text-white"
          rows={3}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
      </Modal>
    </form>
  );
}
