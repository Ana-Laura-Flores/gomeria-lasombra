import { useState, useEffect } from "react";
import {
  crearPago,
  getCuentaCorrienteByCliente,
  crearCuentaCorriente,
} from "../../services/api";
import { useMetodoPago } from "../../hooks/useMetodoPago";

export default function PagoForm({ cliente, onPagoRegistrado }) {
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
  // Agregar / eliminar pagos
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
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pagos.length) return alert("No hay pagos cargados");

    setLoading(true);
    try {
      let cc = cuentaCorriente;

      // Crear cuenta corriente si no existe
      if (!cc) {
        const res = await crearCuentaCorriente({ cliente: clienteId });
        cc = res?.data || res;
        setCuentaCorriente(cc);
      }

      const pagosGuardados = [];

      for (const pago of pagos) {
        const res = await crearPago({
          cliente: clienteId,
          metodo_pago: pago.metodo,
          monto: parseFloat(pago.monto),
          banco: pago.banco || null,
          numero_cheque: pago.numero_cheque || null,
          fecha_cobro: pago.fecha_cobro || null,
          cuenta_corriente: cc.id,
          estado: "confirmado",
        });

        // Normalizar para el modal
        const pagoNormalizado = {
          ...(res?.data || res),
          fecha: (res?.data?.fecha || new Date().toISOString().split("T")[0]),
        };

        pagosGuardados.push(pagoNormalizado);
      }

      // Limpiar lista local
      setPagos([]);
      onPagoRegistrado?.(pagosGuardados); // REFRESCA MODAL + TABLA
    } catch (err) {
      console.error(err);
      alert("Error al registrar el pago");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RENDER
  // =========================
  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded space-y-4">
      <h2 className="text-lg font-semibold">Registrar pago</h2>

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
              <span>{p.metodo} – {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(p.monto)}</span>
              <button type="button" onClick={() => eliminarPago(i)} className="text-red-400">Quitar</button>
            </div>
          ))}
          <p className="text-right font-semibold">
            Total: {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(totalPagosNum)}
          </p>
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
  );
}
