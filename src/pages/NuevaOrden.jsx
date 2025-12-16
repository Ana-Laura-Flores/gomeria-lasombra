import React, { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import ClienteSelect from "../components/ClienteSelect";
import ItemsTable from "../components/ItemsTable";
import OrdenFooter from "../components/OrdenFooter";
import Modal from "../components/Modal";
import useClientes from "../hooks/useClientes";
import useItems from "../hooks/useItems";
import useTiposVehiculo from "../hooks/useTiposVehiculo";

export default function NuevaOrden() {
  const { clientes, loading: loadingClientes } = useClientes();
  const { tipos: tiposVehiculo, loading: loadingTipos } = useTiposVehiculo();

  const [tipoVehiculo, setTipoVehiculo] = useState("");
  const [tipoItem, setTipoItem] = useState("servicio"); // servicio o producto

  const { items: itemsDisponibles, loading: loadingItems } = useItems(
    tipoItem,
    tipoVehiculo
  );

  const loading = loadingClientes || loadingItems || loadingTipos;

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
            onChange={(e) => setFecha(e.target.value)}
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
            onChange={(e) => setPatente(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          />
        </div>
      </div>

      {/* Tipo de ítem */}
      <div className="mb-4">
        <label className="block mb-1">Tipo de ítem</label>
        <select
          value={tipoItem}
          onChange={(e) => setTipoItem(e.target.value)}
          className="w-full p-2 rounded bg-gray-800 border border-gray-700"
        >
          <option value="servicio">Servicio</option>
          <option value="producto">Producto</option>
        </select>
      </div>

      {/* Tipo de vehículo */}
      <div className="mb-4">
        <label className="block mb-1">Tipo de vehículo</label>
        {!loadingTipos && (
          <select
            value={tipoVehiculo}
            onChange={(e) => setTipoVehiculo(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          >
            <option value="">Seleccionar</option>
            {tiposVehiculo.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Botón agregar item */}
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

      {/* Footer */}
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

      {/* Modal */}
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
