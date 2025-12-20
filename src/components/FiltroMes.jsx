export default function FiltroMes({ mes, setMes }) {
  return (
    <div className="mb-4">
      <label className="block text-sm text-gray-400 mb-1">
        Mes
      </label>
      <input
        type="month"
        value={mes}
        onChange={(e) => setMes(e.target.value)}
        className="bg-gray-800 p-2 rounded"
      />
    </div>
  );
}
