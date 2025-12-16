

export default function ClienteSelect({ clientes, value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="w-full p-2 rounded bg-gray-800 border border-gray-700">
      <option value="">Seleccionar cliente</option>
      {clientes.map(c => (
        <option key={c.id} value={c.id}>
          {c.nombre} {c.cuit ? `- ${c.cuit}` : ""}
        </option>
      ))}
    </select>
  );
}
