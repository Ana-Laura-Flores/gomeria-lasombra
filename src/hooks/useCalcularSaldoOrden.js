export function useCalcularSaldoOrden(orden, pagosCliente = [], ordenesCliente = []) {
  if (!orden) return { totalPagado: 0, saldo: 0, estado: "Debe", pagosAplicados: [] };

  const totalOrden = Number(orden.total || 0);

  // 1️⃣ Pagos asociados directamente a la orden
  const pagosDirectos = (orden.pagos || []).reduce(
    (sum, p) => sum + Number(p.monto || 0),
    0
  );

  // 2️⃣ Determinar pagos de cuenta corriente disponibles
  const pagosAplicadosPrevios = ordenesCliente
    .flatMap(o => o.pagos || [])
    .map(p => p.id);

  const pagosDisponibles = pagosCliente
    .filter(p => !p.orden && p.estado === "confirmado" && !pagosAplicadosPrevios.includes(p.id))
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha)); // aplicar por fecha

  let saldoRestante = totalOrden - pagosDirectos;
  const pagosAplicados = pagosDirectos > 0 
    ? (orden.pagos || []).map(p => ({ ...p, aplicado: Number(p.monto || 0) }))
    : [];

  // 3️⃣ Aplicar pagos disponibles hasta cubrir la orden
  for (let pago of pagosDisponibles) {
    if (saldoRestante <= 0) break;

    const aplicable = Math.min(Number(pago.monto || 0), saldoRestante);
    pagosAplicados.push({ ...pago, aplicado: aplicable });
    saldoRestante -= aplicable;
  }

  const totalPagado = totalOrden - saldoRestante;
  const saldo = saldoRestante;
  const estado = saldo === 0 ? "Pagado" : saldo < totalOrden ? "Parcial" : "Debe";

  return { totalPagado, saldo, estado, pagosAplicados };
}
