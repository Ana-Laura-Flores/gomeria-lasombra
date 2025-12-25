export default function CobroSection({
  condicionCobro,
  metodoPago,
  metodos,
  onCondicionChange,
  setMetodoPago,
}) {
  return (
    <>
      <div className="mb-4">
        <label className="block mb-1">Condición de cobro</label>
        <select
          value={condicionCobro}
          onChange={(e) => onCondicionChange(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
        >
          <option value="contado">Contado</option>
          <option value="cuenta_corriente">Cuenta corriente</option>
        </select>
      </div>

      {condicionCobro === "contado" && (
        <div className="mb-4">
          <label className="block mb-1">Método de pago</label>
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          >
            <option value="">Seleccionar</option>
            {metodos.map((m) => (
              <option key={m.value} value={m.value}>
                {m.text}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}
