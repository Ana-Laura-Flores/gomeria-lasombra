import { useState } from "react";
import ItemsTable from "../ItemsTable";

export default function ItemsSection({
  tipoVehiculo,
  itemsOrden,
  setItemsOrden,
  itemsDisponibles,
  loading,
  onAgregarItem,
}) {
  const [tipoSeleccionado, setTipoSeleccionado] = useState("Servicio");

  // Filtrar items según tipo seleccionado
  const itemsFiltrados = itemsDisponibles.filter(
    (item) =>
      (tipoSeleccionado === "Servicio" && item.servicio) ||
      (tipoSeleccionado === "Producto" && item.nombre)
  );

  return (
    <div className="mb-6">
      <div className="flex gap-4 mb-2">
        <label>
          Tipo:
          <select
            value={tipoSeleccionado}
            onChange={(e) => setTipoSeleccionado(e.target.value)}
            className="ml-2 p-1 bg-gray-800 border border-gray-700 rounded"
          >
            <option value="Servicio">Servicio</option>
            <option value="Producto">Producto</option>
          </select>
        </label>

        <button
          onClick={onAgregarItem}
          disabled={!tipoVehiculo}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          + Agregar ítem
        </button>
      </div>

      {loading ? (
        <p>Cargando items...</p>
      ) : (
        <ItemsTable
          itemsOrden={itemsOrden}
          setItemsOrden={setItemsOrden}
          itemsDisponibles={itemsFiltrados}
        />
      )}
    </div>
  );
}
