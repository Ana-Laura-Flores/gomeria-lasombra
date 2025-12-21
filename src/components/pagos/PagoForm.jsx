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
    const [monto, setMonto] = useState("");
    const metodos = useMetodoPago();
    const [metodo, setMetodo] = useState("");

    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
 
        if (!metodo) {
            alert("Seleccioná un método de pago");
            return;
        }

        setLoading(true);

        const montoNumerico = Number(monto);

       

        await crearPago({
            orden: orden.id,
            metodo_pago: metodo,
            monto: montoNumerico,
        });

        const { totalPagado, saldo, estado } = calcularEstadoOrden(
            orden.total,
            orden.total_pagado,
            montoNumerico
        );

        await actualizarOrden(orden.id, {
            total_pagado: totalPagado,
            saldo,
            estado,
        });

        setMonto("");
        setMetodo("");
        setLoading(false);

        onPagoRegistrado();
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-gray-800 p-4 rounded space-y-4"
        >
            <h2 className="font-semibold">Registrar pago</h2>

            <select
                value={metodo}
                onChange={(e) => setMetodo(e.target.value)}
                className="w-full p-2 bg-gray-700 rounded"
                required
            >
                <option value="">Seleccionar método</option>

                {metodos.map((m) => (
                    <option key={m.value} value={m.value}>
                        {m.text}
                    </option>
                ))}
            </select>

            <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="Monto"
                className="w-full p-2 bg-gray-700 rounded"
                required
                min="1"
            />

            <button
                disabled={loading}
                className="bg-green-600 px-4 py-2 rounded"
            >
                {loading ? "Guardando..." : "Registrar pago"}
            </button>
        </form>
    );
}
