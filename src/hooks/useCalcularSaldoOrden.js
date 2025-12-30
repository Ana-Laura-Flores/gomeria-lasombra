export function useCalcularSaldoOrden(ordenes = [], pagosCliente = []) {
  if (!ordenes || ordenes.length === 0) return [];

  // Ordenamos las órdenes por fecha
  const ordenesOrdenadas = [...ordenes].sort(
    (a, b) => new Date(a.fecha) - new Date(b.fecha)
  );

  // Pagos de cuenta corriente disponibles (sin orden asignada)
  const pagosCtaCte = pagosCliente
    .filter((p) => !p.orden && p.estado === "confirmado")
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  let pagosDisponibles = pagosCtaCte.map((p) => ({ ...p })); // clonamos para manipular

  const resultado = ordenesOrdenadas.map((orden) => {
    const totalOrden = Number(orden.total || 0);

    // Pagos asociados directamente a la orden
    const pagosContado = (orden.pagos || []).reduce(
      (sum, p) => sum + Number(p.monto || 0),
      0
    );

    let saldoRestante = totalOrden - pagosContado;
    const pagosAplicados = [];

    // Aplicar pagos de cuenta corriente
    for (let i = 0; i < pagosDisponibles.length; i++) {
      if (saldoRestante <= 0) break;

      const pago = pagosDisponibles[i];
      const aplicable = Math.min(Number(pago.monto || 0), saldoRestante);

      pagosAplicados.push({ ...pago, aplicado: aplicable });
      saldoRestante -= aplicable;
      pagosDisponibles[i].monto -= aplicable; // descontamos lo aplicado del pago disponible
    }

    const totalPagado = totalOrden - saldoRestante;
    const estado =
      saldoRestante === 0
        ? "Pagado"
        : totalPagado > 0
        ? "Parcial"
        : "Debe";

    return {
      ...orden,
      totalPagado,
      saldo: saldoRestante,
      estado,
      pagosAplicados,
    };
  });

  return resultado;
}
