export default function DatosPrincipales({
  fecha,
  setFecha,
  patente,
  setPatente,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div>
        <label className="block mb-1">Fecha</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
        />
      </div>

      <div>
        <label className="block mb-1">Patente</label>
        <input
          placeholder="ABC123"
          value={patente}
          onChange={(e) => setPatente(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
        />
      </div>
    </div>
  );
}
