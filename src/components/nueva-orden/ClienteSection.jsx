import ClienteSelect from "../ClienteSelect";

export default function ClienteSection({
  clientes,
  loading,
  cliente,
  modoClienteNuevo,
  clienteNuevoNombre,
  setCliente,
  setModoClienteNuevo,
  setClienteNuevoNombre,
}) {
  return (
    <div className="md:col-span-2">
      <label className="block mb-1">Cliente</label>

      <div className="flex gap-4 mb-2">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={!modoClienteNuevo}
            onChange={() => setModoClienteNuevo(false)}
          />
          Existente
        </label>

        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={modoClienteNuevo}
            onChange={() => setModoClienteNuevo(true)}
          />
          Nuevo
        </label>
      </div>

      {!modoClienteNuevo ? (
        !loading && (
          <ClienteSelect
            clientes={clientes}
            value={cliente}
            onChange={setCliente}
          />
        )
      ) : (
        <input
          placeholder="Nombre del cliente"
          value={clienteNuevoNombre}
          onChange={(e) => setClienteNuevoNombre(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
        />
      )}
    </div>
  );
}
