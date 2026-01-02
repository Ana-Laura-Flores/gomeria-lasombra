function CuentaCorrientePDF({ cliente, movimientos }) {
  return (
    <div style={{ background: "white", color: "black", padding: 20 }}>
      <h2>Cuenta Corriente - {cliente.nombre}</h2>

      <p>Total: {cliente.total}</p>
      <p>Pagado: {cliente.pagado}</p>
      <p>Saldo: {cliente.saldo}</p>

      <table width="100%" border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Ref</th>
            <th>Debe</th>
            <th>Haber</th>
            <th>Saldo</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((m, i) => (
            <tr key={i}>
              <td>{new Date(m.fecha).toLocaleDateString("es-AR")}</td>
              <td>{m.tipo}</td>
              <td>{typeof m.referencia === "string" ? m.referencia : ""}</td>
              <td>{m.debe || ""}</td>
              <td>{m.haber || ""}</td>
              <td>{m.saldo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
