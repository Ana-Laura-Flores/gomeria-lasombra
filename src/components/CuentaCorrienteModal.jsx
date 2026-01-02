const handlePagoRegistrado = (pagosNuevos) => {
  // 1️⃣ Agregamos los pagos al estado local de extras
  setPagosExtra((prev) => [...prev, ...pagosNuevos]);

  // 2️⃣ Opcional: actualizar cliente dentro de clientesCC si querés
  const clienteIndex = clientesCC.findIndex(c => c.id === clienteId);
  if (clienteIndex !== -1) {
    clientesCC[clienteIndex] = {
      ...clientesCC[clienteIndex],
      pagos: [...clientesCC[clienteIndex].pagos, ...pagosNuevos]
    };
  }

  // 3️⃣ Cerrar modal de pago y abrir modal de éxito
  setShowPago(false);
  setShowSuccess(true);
};
