import { useNavigate } from "react-router-dom";
import { useState } from "react";

import MainLayout from "../layouts/MainLayout";
import Modal from "../components/Modal";

// hook central
import useNuevaOrden from "../hooks/useNuevaOrden";

// data hooks
import useClientes from "../hooks/useClientes";
import useTiposVehiculo from "../hooks/useTiposVehiculo";
import useItems from "../hooks/useItems";
import { useMetodoPago } from "../hooks/useMetodoPago";

// secciones
import DatosPrincipales from "../components/nueva-orden/DatosPrincipales";
import ClienteSection from "../components/nueva-orden/ClienteSection";
import VehiculoSection from "../components/nueva-orden/VehiculoSection";
import CobroSection from "../components/nueva-orden/CobroSection";
import ItemsSection from "../components/nueva-orden/ItemsSection";

// footer
import OrdenFooter from "../components/OrdenFooter";


export default function NuevaOrden() {
  const navigate = useNavigate();
  const estado = useNuevaOrden();
  const [showModal, setShowModal] = useState(false);


  // data hooks
  const { clientes, loading: loadingClientes } = useClientes();
  const { tipos: tiposVehiculo, loading: loadingTipos } = useTiposVehiculo();
  const { items: itemsDisponibles, loading: loadingItems } = useItems(
    estado.tipoVehiculo
  );
  const metodos = useMetodoPago();

  const loading = loadingClientes || loadingTipos || loadingItems;

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-6">Nueva Orden</h1>

      {/* Datos principales */}
      <DatosPrincipales
        fecha={estado.fecha}
        setFecha={estado.setFecha}
        patente={estado.patente}
        setPatente={estado.setPatente}
      />

      {/* Cliente */}
      <ClienteSection
        clientes={clientes}
        loading={loadingClientes}
        cliente={estado.cliente}
        modoClienteNuevo={estado.modoClienteNuevo}
        clienteNuevoNombre={estado.clienteNuevoNombre}
        setCliente={estado.setCliente}
        setModoClienteNuevo={estado.setModoClienteNuevo}
        setClienteNuevoNombre={estado.setClienteNuevoNombre}
      />

      {/* Vehículo */}
      <VehiculoSection
        tipoVehiculo={estado.tipoVehiculo}
        setTipoVehiculo={estado.setTipoVehiculo}
        tiposVehiculo={tiposVehiculo}
        loading={loadingTipos}
      />

      {/* Cobro */}
      <CobroSection
        condicionCobro={estado.condicionCobro}
        metodoPago={estado.metodoPago}
        metodos={metodos}
        onCondicionChange={estado.handleCondicionCobroChange}
        setMetodoPago={estado.setMetodoPago}
      />

      {/* Items */}
      <ItemsSection
        tipoVehiculo={estado.tipoVehiculo}
        itemsOrden={estado.itemsOrden}
        setItemsOrden={estado.setItemsOrden}
        itemsDisponibles={itemsDisponibles}
        loading={loadingItems}
        onAgregarItem={estado.agregarItem}
      />

      {/* Footer */}
      <OrdenFooter
        total={estado.total}
        cliente={estado.cliente}
        fecha={estado.fecha}
        patente={estado.patente}
        condicionCobro={estado.condicionCobro}
        metodoPago={estado.metodoPago}
        items={estado.itemsOrden}
        onSuccess={() => setShowModal(true)}

      />
       {/* Modal de confirmación */}
      <Modal
  open={showModal}
  title="Orden guardada correctamente"
  onClose={() => setShowModal(false)}
  actions={
    <>
    <button
  onClick={() => navigate(`/ordenes/${ordenIdCreada}`)}
  className="px-4 py-2 bg-blue-600 rounded"
>
  Ver orden y descargar PDF
</button>

      <button
        onClick={() => {
          setShowModal(false);
          navigate("/ordenes", { state: { refresh: true } });
        }}
        className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
      >
        Ir a órdenes
      </button>

      <button
        onClick={() => {
          setShowModal(false);
          estado.resetForm();
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
