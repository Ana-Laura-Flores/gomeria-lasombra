import { useState } from "react";
import { useNavigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import ClienteSelect from "../components/ClienteSelect";
import ItemsTable from "../components/ItemsTable";
import OrdenFooter from "../components/OrdenFooter";
import Modal from "../components/Modal";
import useClientes from "../hooks/useClientes";
import useItems from "../hooks/useItems";
import useTiposVehiculo from "../hooks/useTiposVehiculo";

export default function NuevaOrden() {
  const navigate = useNavigate();
  const [tipoVehiculo, setTipoVehiculo] = useState("");
  const { tipos: tiposVehiculo, loading: loadingTipos } = useTiposVehiculo();
  const { items: itemsDisponibles, loading: loadingItems } = useItems(tipoVehiculo);
  const { clientes, loading: loadingClientes } = useClientes();

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
    setTipoVehiculo("");
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

      {/* Select Tipo de vehículo */}
      <div className="mb-4">
        <label className="block mb-1">Tipo de vehículo</label>
        {loadingTipos ? (
          <p>Cargando tipos de vehículo...</p>
        ) : (
          <select
            value={tipoVehiculo}
            onChange={e => setTipoVehiculo(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
          >
            <option value="">Seleccionar</option>
            {tiposVehiculo.map(tipo => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        )}
      </div>
{/* Condición de cobro */}
<div className="mb-4">
  <label className="block mb-1">Condición de cobro</label>
  <select
    value={condicionCobro}
    onChange={e => setCondicionCobro(e.target.value)}
    className="w-full p-2 rounded bg-gray-800 border border-gray-700"
  >
    <option value="contado">Contado</option>
    <option value="cuenta_corriente">Cuenta corriente</option>
  </select>
</div>

{/* Método de pago: solo si es contado */}
{condicionCobro === "contado" && (
  <div className="mb-4">
    <label className="block mb-1">Método de pago</label>
    <select
      value={metodoPago}
      onChange={e => setMetodoPago(e.target.value)}
      className="w-full p-2 rounded bg-gray-800 border border-gray-700"
    >
      <option value="efectivo">Efectivo</option>
      <option value="tarjeta">Tarjeta</option>
      <option value="transferencia">Transferencia</option>
    </select>
  </div>
)}

      {/* Botón para agregar items */}
      <button
        onClick={agregarItem}
        className="px-4 py-2 mb-4 bg-blue-600 rounded hover:bg-blue-700"
        disabled={!tipoVehiculo} // solo habilitar si hay tipo seleccionado
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
  navigate("/ordenes", { state: { refresh: true } });
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
