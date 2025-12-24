import { useState, useMemo } from "react";

export default function ClienteSelect({ clientes, value, onChange }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) =>
      `${c.nombre} ${c.cuit || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [clientes, search]);

  const clienteSeleccionado = clientes.find((c) => c.id === value);

  return (
    <div className="relative">
      <input
        type="text"
        value={clienteSeleccionado ? clienteSeleccionado.nombre : search}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
          onChange("");
        }}
        placeholder="Buscar cliente..."
        className="w-full p-2 rounded bg-gray-800 border border-gray-700"
      />

      {open && (
        <ul className="absolute z-10 w-full bg-gray-900 border border-gray-700 rounded mt-1 max-h-60 overflow-y-auto">
          {clientesFiltrados.length === 0 && (
            <li className="p-2 text-gray-400">Sin resultados</li>
          )}

          {clientesFiltrados.map((c) => (
            <li
              key={c.id}
              className="p-2 hover:bg-gray-700 cursor-pointer"
              onClick={() => {
                onChange(c.id);
                setSearch("");
                setOpen(false);
              }}
            >
              {c.nombre} {c.cuit ? `- ${c.cuit}` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
