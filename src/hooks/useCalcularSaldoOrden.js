export function useCalcularSaldoOrden(orden, pagosCliente = []) {
  if (!orden) return { totalPagado: 0, saldo: 0, estado: "Debe", pagosAplicados: [] };

  const totalOrden = Number(orden.total || 0);

  // Pagos asociados directamente a esta orden
  const pagosDirectos = (orden.pagos || []).reduce(
    (sum, p) => sum + Number(p.monto || 0),
    0
  );

  let saldoRestante = totalOrden - pagosDirectos;
  const pagosAplicados = [];

  // Pagos de cuenta corriente que no tienen orden (disponibles)
  const pagosCtaCte = (pagosCliente || [])
    .filter((p) => !p.orden && p.estado === "confirmado")
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  for (let pago of pagosCtaCte) {
    if (saldoRestante <= 0) break;
    const montoPago = Number(pago.monto || 0);

    // Aplicar solo hasta cubrir el saldo restante
    const aplicable = Math.min(montoPago, saldoRestante);

    if (aplicable > 0) {
      pagosAplicados.push({ ...pago, aplicado: aplicable });
      saldoRestante -= aplicable;
    }
  }

  const totalPagado = totalOrden - saldoRestante;
  const saldo = saldoRestante;
  const estado =
    saldo === 0 ? "Pagado" : saldo < totalOrden ? "Parcial" : "Debe";

  return { totalPagado, saldo, estado, pagosAplicados };
}
