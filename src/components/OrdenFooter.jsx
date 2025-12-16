import React from "react";
export default function OrdenFooter({
  total,
  fecha,
  cliente,
  patente,
  condicionCobro,
  metodoPago,
  items,
}) {
  const guardarOrden = () => {
    if (!cliente || items.length === 0) {
      alert("Falta cliente o ítems");
      return;
    }

    const orden = {
      id: Date.now(),
      fecha,
      cliente,
      patente,
      condicion_cobro: condicionCobro,
      metodo_pago:
        condicionCobro === "contado" ? metodoPago : null,
      total,
      items,
      estado:
        condicionCobro === "contado" ? "pagado" : "pendiente",
    };

    const ordenesGuardadas =
      JSON.parse(localStorage.getItem("ordenes")) || [];

    ordenesGuardadas.push(orden);

    localStorage.setItem(
      "ordenes",
      JSON.stringify(ordenesGuardadas)
    );

    alert("Orden guardada correctamente");
  };

  return (
    <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-700 pt-4">
      <div className="text-xl font-bold">
        Total: $ {total}
      </div>

      <button
        onClick={guardarOrden}
        className="px-6 py-3 bg-green-600 rounded hover:bg-green-700"
      >
        Guardar orden
      </button>
    </div>
  );
}

