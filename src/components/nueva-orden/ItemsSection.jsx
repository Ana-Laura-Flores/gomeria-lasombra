// ItemsSection.jsx
import ItemsTable from "./ItemsTable";
import { useItems } from "../../hooks/useItems";
import useProductos from "../../hooks/useProductos";

export default function ItemsSection({
  tipoVehiculo,
  itemsOrden,
  setItemsOrden,
  loading: loadingGlobal,
  onAgregarItem,
}) {
  // Hook para traer servicios/tarifas
  const { items: itemsDisponibles, loading: loadingItems } = useItems(tipoVehiculo);

  // Hook para traer productos
  const { productos, loading: loadingProductos } = useProductos(tipoVehiculo);

  const loading = loadingGlobal || loadingItems || loadingProductos;

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
          itemsDisponibles={itemsDisponibles} // servicios
          productosDisponibles={productos}   // productos
        />
      )}
    </>
  );
}
