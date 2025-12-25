import ItemsTable from "../ItemsTable";

export default function ItemsSection({
  tipoVehiculo,
  itemsOrden,
  setItemsOrden,
  itemsDisponibles,
  loading,
  onAgregarItem,
}) {
  return (
    <>
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
          itemsDisponibles={itemsDisponibles}
        />
      )}
    </>
  );
}
