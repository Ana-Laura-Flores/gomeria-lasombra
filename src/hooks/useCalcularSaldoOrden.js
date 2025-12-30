export function useCalcularSaldoOrden(orden, pagosCliente = []) {
  if (!orden) return { totalPagado: 0, saldo: 0, estado: "Debe", pagosAplicados: [] };

  const totalOrden = Number(orden.total || 0);

  // Pagos asociados directamente a la orden
  const pagosContado = (orden.pagos || []).reduce(
    (sum, p) => sum + Number(p.monto || 0),
    0
  );

  // Pagos de cuenta corriente disponibles
  let saldoRestante = totalOrden - pagosContado;
  const pagosAplicados = [];

  const pagosCtaCte = pagosCliente
    .filter((p) => !p.orden && p.estado === "confirmado")
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha)); // aplicar por orden de fecha

  for (let pago of pagosCtaCte) {
    if (saldoRestante <= 0) break;

    const aplicable = Math.min(Number(pago.monto || 0), saldoRestante);
    pagosAplicados.push({ ...pago, aplicado: aplicable });
    saldoRestante -= aplicable;
  }

  const totalPagado = totalOrden - saldoRestante;
  const saldo = saldoRestante;
  const estado =
    saldo === 0
      ? "Pagado"
      : saldo < totalOrden
      ? "Parcial"
      : "Debe";

  return { totalPagado, saldo, estado, pagosAplicados };
}
