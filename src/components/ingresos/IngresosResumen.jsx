export default function IngresosResumen({ ordenes }) {
  const total = ordenes.reduce(
    (acc, o) => acc + Number(o.total_pagado),
    0
  );

  return <div>Total ingresos: {total}</div>;
}
