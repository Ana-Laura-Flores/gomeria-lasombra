import React, { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { tarifasMock } from "../mock-tarifas/tarifas";
import OrdenFooter from "../components/OrdenFooter";


export default function NuevaOrden() {
  const [cliente, setCliente] = useState("");
  const [patente, setPatente] = useState("");
  const [items, setItems] = useState([]);

  const [fecha, setFecha] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [condicionCobro, setCondicionCobro] = useState("contado");
  const [metodoPago, setMetodoPago] = useState("efectivo");

  const agregarItem = () => {
    setItems([
      ...items,
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

  const actualizarItem = (id, campo, valor) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const actualizado = { ...item, [campo]: valor };
          actualizado.subtotal =
            actualizado.cantidad * actualizado.precio_unitario;
          return actualizado;
        }
        return item;
      })
    );
  };

  const seleccionarTarifa = (id, tarifaId) => {
    const tarifa = tarifasMock.find(t => t.id === Number(tarifaId));
    if (!tarifa) return;

    setItems(
      items.map(item =>
        item.id === id
          ? {
              ...item,
              tarifaId,
              servicio: tarifa.servicio,
              precio_unitario: tarifa.precio,
              subtotal: tarifa.precio * item.cantidad,
            }
          : item
      )
    );
  };

  const total = items.reduce((acc, item) => acc + item.subtotal, 0);

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
    <input
      placeholder="Cliente"
      value={cliente}
      onChange={(e) => setCliente(e.target.value)}
      className="w-full p-2 rounded bg-gray-800 border border-gray-700"
    />
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

   

      {/* Pago */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
  <div>
    <label className="block mb-1">Condición de pago</label>
    <select
      value={condicionCobro}
      onChange={(e) => setCondicionCobro(e.target.value)}
      className="w-full p-2 rounded bg-gray-800 border border-gray-700"
    >
      <option value="contado">Contado</option>
      <option value="cuenta_corriente">Cuenta corriente</option>
    </select>
  </div>

  {condicionCobro === "contado" && (
    <div>
      <label className="block mb-1">Método de pago</label>
      <select
        value={metodoPago}
        onChange={(e) => setMetodoPago(e.target.value)}
        className="w-full p-2 rounded bg-gray-800 border border-gray-700"
      >
        <option value="efectivo">Efectivo</option>
        <option value="transferencia">Transferencia</option>
        <option value="mercadopago">Mercado Pago</option>
        <option value="cheque">Cheque</option>
      </select>
    </div>
  )}
</div>

      {/* Items */}
      <button
        onClick={agregarItem}
        className="px-4 py-2 mb-4 bg-blue-600 rounded hover:bg-blue-700"
      >
        + Agregar ítem
      </button>

      <table className="w-full text-left border-collapse mb-6">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="p-2">Servicio</th>
            <th className="p-2">Cantidad</th>
            <th className="p-2">Precio</th>
            <th className="p-2">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-gray-800">
              <td className="p-2">
                <select
                  className="w-full p-1 bg-gray-800 border border-gray-700 rounded"
                  value={item.tarifaId}
                  onChange={(e) =>
                    seleccionarTarifa(item.id, e.target.value)
                  }
                >
                  <option value="">Seleccionar</option>
                  {tarifasMock.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.servicio} - ${t.precio}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-2">
                <input
                  type="number"
                  className="w-20 p-1 bg-gray-800 border border-gray-700 rounded"
                  value={item.cantidad}
                  onChange={(e) =>
                    actualizarItem(item.id, "cantidad", Number(e.target.value))
                  }
                />
              </td>
              <td className="p-2">$ {item.precio_unitario}</td>
              <td className="p-2">$ {item.subtotal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <OrdenFooter
  total={total}
  fecha={fecha}
  cliente={cliente}
  patente={patente}
  condicionCobro={condicionCobro}
  metodoPago={metodoPago}
  items={items}
/>

    </MainLayout>
  );
}
