import { useState, useEffect } from "react";
import {
  crearPago,
  impactarPagoEnCuentaCorriente,
  getCuentaCorrienteByCliente,
} from "../../services/api";
import { useMetodoPago } from "../../hooks/useMetodoPago";
import { Link, useNavigate } from "react-router-dom";

export default function PagoForm({ cliente, onPagoRegistrado }) {
  const metodos = useMetodoPago();

  // Puede venir objeto o id
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

  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  // =========================
  // Cargar cuenta corriente
  // =========================
  useEffect(() => {
    if (!clienteId) return;
    const cargarCC = async () => {
      try {
        const res = await getCuentaCorrienteByCliente(clienteId);
        setCuentaCorriente(res.data?.[0] || null);
      } catch (err) {
        console.error("Error cargando cuenta corriente", err);
      }
    };
    cargarCC();
  }, [clienteId]);

  const totalPagosNum = pagos.reduce((acc, p) => acc + parseFloat(p.monto || 0), 0);

  // =========================
  // Agregar pago a la lista
  // =========================
  const agregarPago = () => {
    if (!pagoActual.metodo || !pagoActual.monto) return;

    setPagos((prev) => [...prev, pagoActual]);
    setPagoActual({ metodo: "", monto: "", banco: "", numero_cheque: "", fecha_cobro: "" });
  };

  const eliminarPago = (index) => setPagos((prev) => prev.filter((_, i) => i !== index));

  // =========================
  // Guardar pagos
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pagos.length) return alert("No hay pagos cargados");
    if (!cuentaCorriente) return alert("El cliente no tiene cuenta corriente");

    setLoading(true);

    try {
      const totalPagosNumLocal = pagos.reduce((acc, p) => acc + parseFloat(p.monto), 0);

      // Crear pagos en paralelo
      await Promise.all(
        pagos.map((pago) =>
          crearPago({
            cliente: clienteId,
            metodo_pago: pago.metodo,
            monto: parseFloat(pago.monto),
            banco: pago.banco || null,
            numero_cheque: pago.numero_cheque || null,
            fecha_cobro: pago.fecha_cobro || null,
            cuenta_corriente: cuentaCorriente.id,
            estado: "confirmado",
          })
        )
      );

      // Impactar saldo en cuenta corriente
      await impactarPagoEnCuentaCorriente(clienteId, totalPagosNumLocal);

      // Refrescar cuenta corriente
      const res = await getCuentaCorrienteByCliente(clienteId);
      setCuentaCorriente(res.data?.[0] || null);

      // Limpiar pagos
      setPagos([]);

      // Mostrar modal de éxito
      setShowSuccess(true);

      // Llamar callback padre para refrescar lista de clientesCC
      onPagoRegistrado?.();
    } catch (err) {
      console.error(err);
      alert("Error al registrar el pago");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Render
  // =========================
  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded space-y-4">
        <h2 className="text-lg font-semibold">Registrar pago</h2>

        <select
          value={pagoActual.metodo}
          onChange={(e) => setPagoActual({ ...pagoActual, metodo: e.target.value })}
          className="w-full p-2 bg-gray-700 rounded"
        >
          <option value="">Método de pago</option>
          {metodos.map((m) => (
            <option key={m.value} value={m.value}>
              {m.text}
            </option>
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
              onChange={(e) =>
                setPagoActual({ ...pagoActual, numero_cheque: e.target.value })
              }
              className="w-full p-2 bg-gray-700 rounded"
            />
            <input
              type="date"
              value={pagoActual.fecha_cobro}
              onChange={(e) =>
                setPagoActual({ ...pagoActual, fecha_cobro: e.target.value })
              }
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
                <span>
                  {p.metodo} – ${p.monto}
                </span>
                <button
                  type="button"
                  onClick={() => eliminarPago(i)}
                  className="text-red-400"
                >
                  Quitar
                </button>
              </div>
            ))}
            <p className="text-right font-semibold">Total: ${totalPagosNum}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 w-full py-2 rounded disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Confirmar pagos"}
        </button>
      </form>

      {/* ------------------- */}
      {/* MODAL DE ÉXITO */}
      {/* ------------------- */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-lg w-80 text-center space-y-4">
            <h2 className="text-lg font-bold mb-2">Pago registrado correctamente</h2>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate(`/cuentas/${clienteId}`)}
                className="bg-blue-600 text-white py-2 rounded"
              >
                Ver cuenta corriente
              </button>
              <button
                onClick={() => navigate("/ordenes")}
                className="bg-gray-600 text-white py-2 rounded"
              >
                Volver a órdenes
              </button>
              <button
                onClick={() => setShowSuccess(false)}
                className="bg-gray-400 text-white py-2 rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
