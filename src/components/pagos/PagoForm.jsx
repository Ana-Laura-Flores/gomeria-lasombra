import { useState } from "react";
import { crearPago, actualizarOrden } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useMetodoPago } from "../../hooks/useMetodoPago";

const calcularEstadoOrden = (total, totalPagadoAnterior, nuevoMonto) => {
  const totalPagado =
    Number(totalPagadoAnterior || 0) + Number(nuevoMonto || 0);

  const saldo = Math.max(Number(total) - totalPagado, 0);

  let estado = "pendiente";
  if (totalPagado > 0 && saldo > 0) estado = "parcial";
  if (saldo === 0) estado = "pagado";

  return { totalPagado, saldo, estado };
};

export default function PagoForm({ orden, onPagoRegistrado }) {
  const navigate = useNavigate();
  const metodos = useMetodoPago();

  const [pagos, setPagos] = useState([]);

  const [pagoActual, setPagoActual] = useState({
    metodo: "",
    monto: "",
    banco: "",
    numero_cheque: "",
    fecha_cheque: "",
  });

  const [loading, setLoading] = useState(false);

  const totalPagos = pagos.reduce(
    (acc, p) => acc + Number(p.monto || 0),
    0
  );

  const agregarPago = () => {
    if (!pagoActual.metodo || !pagoActual.monto) {
      alert("Completá método y monto");
      return;
    }

    if (
      pagoActual.metodo === "cheque" &&
      (!pagoActual.banco ||
        !pagoActual.numero_cheque ||
        !pagoActual.fecha_cheque)
    ) {
      alert("Completá todos los datos del cheque");
      return;
    }

    setPagos([...pagos, pagoActual]);

    setPagoActual({
      metodo: "",
      monto: "",
      banco: "",
      numero_cheque: "",
      fecha_cheque: "",
    });
  };

  const eliminarPago = (index) => {
    setPagos(pagos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (pagos.length === 0) {
      alert("Agregá al menos un pago");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Crear todos los pagos
      for (const pago of pagos) {
        await crearPago({
          orden: orden.id,
          metodo_pago: pago.metodo,
          monto: Number(pago.monto),
          banco: pago.banco || null,
          numero_cheque: pago.numero_cheque || null,
          fecha_cheque: pago.fecha_cheque || null,
        });
      }

      // 2️⃣ Actualizar orden
      const { totalPagado, saldo, estado } = calcularEstadoOrden(
        orden.total,
        orden.total_pagado,
        totalPagos
      );

      await actualizarOrden(orden.id, {
        total_pagado: totalPagado,
        saldo,
        estado,
      });

      onPagoRegistrado();
    } catch (error) {
      console.error("Error registrando pago:", error);
      alert("Error al registrar el pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 p-4 rounded space-y-4"
    >
      <h2 className="font-semibold text-lg">Registrar pago</h2>

      {/* MÉTODO */}
      <select
        value={pagoActual.metodo}
        onChange={(e) =>
          setPagoActual({ ...pagoActual, metodo: e.target.value })
        }
        className="w-full p-2 bg-gray-700 rounded"
      >
        <option value="">Seleccionar método</option>
        {metodos.map((m) => (
          <option key={m.value} value={m.value}>
            {m.text}
          </option>
        ))}
      </select>

      {/* MONTO */}
      <input
        type="number"
        min="1"
        placeholder="Monto"
        value={pagoActual.monto}
        onChange={(e) =>
          setPagoActual({ ...pagoActual, monto: e.target.value })
        }
        className="w-full p-2 bg-gray-700 rounded"
      />

      {/* DATOS CHEQUE */}
      {pagoActual.metodo === "cheque" && (
        <div className="space-y-2">
          <input
            placeholder="Banco"
            value={pagoActual.banco}
            onChange={(e) =>
              setPagoActual({ ...pagoActual, banco: e.target.value })
            }
            className="w-full p-2 bg-gray-700 rounded"
          />

          <input
            placeholder="Número de cheque"
            value={pagoActual.numero_cheque}
            onChange={(e) =>
              setPagoActual({
                ...pagoActual,
                numero_cheque: e.target.value,
              })
            }
            className="w-full p-2 bg-gray-700 rounded"
          />

          <input
            type="date"
            value={pagoActual.fecha_cheque}
            onChange={(e) =>
              setPagoActual({
                ...pagoActual,
                fecha_cheque: e.target.value,
              })
            }
            className="w-full p-2 bg-gray-700 rounded"
          />
        </div>
      )}

      {/* AGREGAR PAGO */}
      <button
        type="button"
        onClick={agregarPago}
        className="bg-blue-600 px-4 py-2 rounded w-full"
      >
        Agregar pago
      </button>

      {/* LISTA DE PAGOS */}
      {pagos.length > 0 && (
        <div className="space-y-2">
          {pagos.map((p, i) => (
            <div
              key={i}
              className="bg-gray-700 p-2 rounded flex justify-between items-start"
            >
              <div>
                <p className="font-semibold">
                  {p.metodo} – ${p.monto}
                </p>
                {p.metodo === "cheque" && (
                  <p className="text-sm text-gray-300">
                    {p.banco} | Nº {p.numero_cheque} |{" "}
                    {p.fecha_cheque}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => eliminarPago(i)}
                className="text-red-400 text-sm"
              >
                Quitar
              </button>
            </div>
          ))}

          <p className="text-right font-semibold">
            Total pagos: ${totalPagos}
          </p>
        </div>
      )}

      {/* SUBMIT */}
      <button
        disabled={loading}
        className="bg-green-600 px-4 py-2 rounded w-full"
      >
        {loading ? "Guardando..." : "Confirmar pagos"}
      </button>
    </form>
  );
}
