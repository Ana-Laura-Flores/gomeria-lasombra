import ItemsTable from "../ItemsTable";

export default function ItemsSection({
  tipoVehiculo,
  itemsOrden,
  setItemsOrden,
  itemsDisponibles,
  loading,
  onAgregarItem,
}) {
  // Agregar el campo tipo_item a cada ítem si no existe
  const itemsConTipo = itemsDisponibles.map((item) => ({
    ...item,
    tipo_item: item.tipo_item || (item.servicio ? "Servicio" : "Producto"),
  }));

  return (
    <div className="mb-6">
      <button
        onClick={onAgregarItem}
        disabled={!tipoVehiculo}
        className="px-4 py-2 mb-4 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        + Agregar ítem
      </button>

      {loading ? (
        <p>Cargando items...</p>
      ) : (
        <ItemsTable
          itemsOrden={itemsOrden}
          setItemsOrden={setItemsOrden}
          itemsDisponibles={itemsConTipo}
          mostrarTipo // <-- nueva prop para indicar que se muestre el tipo
        />
      )}
    </div>
  );
}
