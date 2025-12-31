import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function useNuevaOrden() {
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));

  const [cliente, setCliente] = useState("");
  const [modoClienteNuevo, setModoClienteNuevo] = useState(false);
  const [clienteNuevoNombre, setClienteNuevoNombre] = useState("");

  const [patente, setPatente] = useState("");
  const [tipoVehiculo, setTipoVehiculo] = useState("");

  const [itemsOrden, setItemsOrden] = useState([]);

  const [condicionCobro, setCondicionCobro] = useState("contado");
  const [metodoPago, setMetodoPago] = useState("efectivo");

  const [ordenCreadaId, setOrdenCreadaId] = useState(null);

  // Agregar ítem vacío con filaId único
  const agregarItem = () => {
    setItemsOrden(prev => [
      ...prev,
      {
        filaId: uuidv4(), // <--- ID único por fila
        itemId: "",       // referencia al producto/servicio seleccionado
        nombre: "",       // nombre del item
        tipo_item: "",    // "Servicio" o "Producto"
        cantidad: 1,
        precio_unitario: 0,
        subtotal: 0,
      },
    ]);
  };

  const total = itemsOrden.reduce((acc, i) => acc + i.subtotal, 0);

  const resetForm = () => {
    setCliente("");
    setClienteNuevoNombre("");
    setModoClienteNuevo(false);
    setPatente("");
    setItemsOrden([]);
    setCondicionCobro("contado");
    setMetodoPago("efectivo");
    setFecha(new Date().toISOString().slice(0, 10));
    setTipoVehiculo("");
  };

  const handleCondicionCobroChange = (value) => {
    setCondicionCobro(value);
    setMetodoPago(value === "contado" ? "efectivo" : "");
  };

  return {
    // state
    fecha,
    cliente,
    modoClienteNuevo,
    clienteNuevoNombre,
    patente,
    tipoVehiculo,
    itemsOrden,
    condicionCobro,
    metodoPago,
    total,
    ordenCreadaId,

    // setters
    setFecha,
    setCliente,
    setModoClienteNuevo,
    setClienteNuevoNombre,
    setPatente,
    setTipoVehiculo,
    setItemsOrden,
    setMetodoPago,
    setOrdenCreadaId,

    // actions
    agregarItem,
    resetForm,
    handleCondicionCobroChange,
  };
}
