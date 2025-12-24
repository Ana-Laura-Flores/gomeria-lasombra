import { useState, useMemo } from "react";

export default function ClienteSelect({ clientes, value, onChange }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) =>
      c.nombre.toLowerCase().includes(search.toLowerCase())
    );
  }, [clientes, search]);

  const clienteSeleccionado = clientes.find((c) => c.id === value);

  return (
    <div className="relative">
      <input
        type="text"
        value={open ? search : clienteSeleccionado?.nombre || ""}
        placeholder="Buscar cliente..."
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="w-full p-2 rounded bg-gray-800 border border-gray-700"
      />

      {open && (
        <ul className="absolute z-50 w-full bg-gray-800 border border-gray-700 max-h-60 overflow-auto rounded mt-1">
          {clientesFiltrados.length === 0 && (
            <li className="p-2 text-gray-400">Sin resultados</li>
          )}

          {clientesFiltrados.map((c) => (
            <li
              key={c.id}
              onClick={() => {
                onChange(c.id);
                setSearch("");
                setOpen(false);
              }}
              className="p-2 cursor-pointer hover:bg-gray-700"
            >
              {c.nombre}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
