export default function Filters({
  filtroDeuda, setFiltroDeuda,
  searchNombre, setSearchNombre,
  fechaDesde, setFechaDesde,
  fechaHasta, setFechaHasta
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={filtroDeuda}
          onChange={e => setFiltroDeuda(e.target.checked)}
          className="accent-blue-600"
        />
        Mostrar solo clientes con deuda
      </label>

      <input
        type="text"
        placeholder="Buscar por nombre"
        value={searchNombre}
        onChange={e => setSearchNombre(e.target.value)}
        className="p-2 rounded bg-gray-700 border border-gray-600 text-white"
      />

      <div className="flex gap-2 items-center">
        <span>Desde:</span>
        <input
          type="date"
          value={fechaDesde}
          onChange={e => setFechaDesde(e.target.value)}
          className="p-2 rounded bg-gray-700 border border-gray-600 text-white"
        />
      </div>

      <div className="flex gap-2 items-center">
        <span>Hasta:</span>
        <input
          type="date"
          value={fechaHasta}
          onChange={e => setFechaHasta(e.target.value)}
          className="p-2 rounded bg-gray-700 border border-gray-600 text-white"
        />
      </div>
    </div>
  );
}
