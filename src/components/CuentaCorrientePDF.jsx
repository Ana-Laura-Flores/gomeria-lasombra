import logo from "../assets/logo.jpg";
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
      src={logo}   // ajustá ruta si hace falta
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
 <table
  width="100%"
  cellPadding="6"
  cellSpacing="0"
  style={{
    borderCollapse: "separate",
    borderSpacing: "0 6px",
  }}
>
  <thead>
    <tr style={{ background: "#e5e7eb" }}>
      <th align="left" style={{ borderBottom: "2px solid #999" }}>Fecha</th>
      <th align="left" style={{ borderBottom: "2px solid #999" }}>Tipo</th>
      <th align="left" style={{ borderBottom: "2px solid #999" }}>Referencia</th>
      <th align="right" style={{ borderBottom: "2px solid #999" }}>Debe</th>
      <th align="right" style={{ borderBottom: "2px solid #999" }}>Haber</th>
      <th align="right" style={{ borderBottom: "2px solid #999" }}>Saldo</th>
    </tr>
  </thead>

  <tbody>
    {movimientos.map((m, i) => (
      <tr
        key={i}
        style={{
          background: i % 2 === 0 ? "#fafafa" : "#ffffff",
        }}
      >
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
<></>

  {/* FOOTER */}
  <div style={{ marginTop: 16, textAlign: "center", fontSize: 10, color: "#666" }}>
    Documento generado automáticamente – Sistema Gomería La Sombra
  </div>
</div>

  );
}
