export default function CuentaCorrientePDF({ cliente, movimientos }) {
  return (
   <div
  id="pdf-cuenta-corriente"
  style={{
    background: "white",
    color: "#000",
    padding: 24,
    fontFamily: "Arial, sans-serif",
    fontSize: 12,
  }}
>
  {/* HEADER */}
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <img
      src="./assets/logo.jpg"   // ajustá ruta si hace falta
      alt="Logo"
      style={{ height: 40 }}
    />
    <div style={{ textAlign: "right" }}>
      <h2 style={{ margin: 0 }}>Cuenta Corriente</h2>
      <small>{new Date().toLocaleDateString("es-AR")}</small>
    </div>
  </div>

  <hr style={{ margin: "12px 0" }} />

  {/* CLIENTE */}
  <div style={{ marginBottom: 12 }}>
    <strong>Cliente:</strong> {cliente.nombre}
  </div>

  {/* TOTALES */}
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 16,
      padding: 12,
      border: "1px solid #ccc",
      borderRadius: 4,
    }}
  >
    <div>
      <div>Total</div>
      <strong>${cliente.total}</strong>
    </div>
    <div>
      <div>Pagado</div>
      <strong>${cliente.pagado}</strong>
    </div>
    <div>
      <div>Saldo</div>
      <strong>${cliente.saldo}</strong>
    </div>
  </div>

  {/* TABLA */}
  <table width="100%" cellPadding="6" cellSpacing="0" style={{ borderCollapse: "collapse" }}>
    <thead>
      <tr style={{ background: "#f0f0f0" }}>
        <th align="left">Fecha</th>
        <th align="left">Tipo</th>
        <th align="left">Referencia</th>
        <th align="right">Debe</th>
        <th align="right">Haber</th>
        <th align="right">Saldo</th>
      </tr>
    </thead>
    <tbody>
      {movimientos.map((m, i) => (
        <tr key={i} style={{ borderBottom: "1px solid #ddd" }}>
          <td>{new Date(m.fecha).toLocaleDateString("es-AR")}</td>
          <td>{m.tipo}</td>
          <td>{typeof m.referencia === "string" ? m.referencia : ""}</td>
          <td align="right">{m.debe ? `$${m.debe}` : ""}</td>
          <td align="right">{m.haber ? `$${m.haber}` : ""}</td>
          <td align="right">${m.saldo}</td>
        </tr>
      ))}
    </tbody>
  </table>

  {/* FOOTER */}
  <div style={{ marginTop: 16, textAlign: "center", fontSize: 10, color: "#666" }}>
    Documento generado automáticamente – Sistema Gomería La Sombra
  </div>
</div>

  );
}
