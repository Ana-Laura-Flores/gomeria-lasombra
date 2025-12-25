export default function VehiculoSection({
  tipoVehiculo,
  setTipoVehiculo,
  tiposVehiculo,
  loading,
}) {
  return (
    <div className="mb-4">
      <label className="block mb-1">Tipo de vehículo</label>

      {loading ? (
        <p>Cargando tipos de vehículo...</p>
      ) : (
        <select
          value={tipoVehiculo}
          onChange={(e) => setTipoVehiculo(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
        >
          <option value="">Seleccionar</option>
          {tiposVehiculo.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
