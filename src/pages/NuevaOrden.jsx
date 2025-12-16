import React, { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import ClienteSelect from "../components/ClienteSelect";
import ItemsTable from "../components/ItemsTable";
import OrdenFooter from "../components/OrdenFooter";
import Modal from "../components/Modal";
import useClientes from "../hooks/useClientes";
import useItems from "../hooks/useItems";

export default function NuevaOrden() {
  const { clientes, loading: loadingClientes } = useClientes();
  const { items: itemsDisponibles, loading: loadingItems } = useItems();

  // Loading unificado
  const loading = loadingClientes || loadingItems;

  const [cliente, setCliente] = useState("");
  const [patente, setPatente] = useState("");
  const [itemsOrden, setItemsOrden] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [condicionCobro, setCondicionCobro] = useState("contado");
  const [metodoPago, setMetodoPago] = useState("efectivo");

  const total = itemsOrden.reduce((acc, i) => acc + i.subtotal, 0);
const agregarItem = () => {
  setItemsOrden([
    ...itemsOrden,
    {
      id: Date.now(),
      tarifaId: "",
      servicio: "",
      cantidad: 1,
      precio_unitario: 0,
      subtotal: 0,
    },
  ]);
};

  const resetForm = () => {
    setCliente("");
    setPatente("");
    setItemsOrden([]);
    setCondicionCobro("contado");
    setMetodoPago("efectivo");
    setFecha(new Date().toISOString().slice(0, 10));
  };

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-6">Nueva Orden</h1>

      {/* Datos principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block mb-1">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1">Cliente</label>
          {!loading && (
            <ClienteSelect
              clientes={clientes}
              value={cliente}
              onChange={setCliente}
            />
          )}
        </div>

        <div>
          <label className="block mb-1">Patente</label>
          <input
            placeholder="ABC123"
            value={patente}
            onChange={e => setPatente(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          />
        </div>
      </div>
{/* Botón para agregar items */}
<button
  onClick={agregarItem}
  className="px-4 py-2 mb-4 bg-blue-600 rounded hover:bg-blue-700"
>
  + Agregar ítem
</button>

      {/* Items */}
      {!loading ? (
        <ItemsTable
          itemsOrden={itemsOrden}
          setItemsOrden={setItemsOrden}
          itemsDisponibles={itemsDisponibles}
        />
      ) : (
        <p>Cargando items...</p>
      )}

      {/* Footer con botón de guardar */}
      <OrdenFooter
        total={total}
        cliente={cliente}
        fecha={fecha}
        patente={patente}
        condicionCobro={condicionCobro}
        metodoPago={metodoPago}
        items={itemsOrden}
        onSuccess={() => {
          setShowModal(true);
          resetForm();
        }}
      />

      {/* Modal de confirmación */}
      <Modal
        open={showModal}
        title="Orden guardada correctamente"
        onClose={() => setShowModal(false)}
        actions={
          <>
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              Seguir cargando
            </button>
            <button
              onClick={() => {
                setShowModal(false);
                window.scrollTo(0, 0);
              }}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
            >
              Nueva orden
            </button>
          </>
        }
      >
        La orden se guardó en el sistema. Podés cargar otra o seguir trabajando.
      </Modal>
    </MainLayout>
  );
}
