import { useNavigate } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

// hook central
import useNuevaOrden from "../hooks/useNuevaOrden";

// data hooks existentes
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

// footer existente
import OrdenFooter from "../components/OrdenFooter"

export default function NuevaOrden() {
  const navigate = useNavigate();
  const estado = useNuevaOrden();

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
        onSuccess={() => navigate("/ordenes", { state: { refresh: true } })}
      />
    </MainLayout>
  );
}
