import logo from "../assets/logo.jpg";

export default function CuentaCorrientePDF({ cliente, movimientos }) {
  let saldoAcumulado = 0;

  return (
    <div
      id="pdf-cuenta-corriente"
      style={{
        background: "white",
        color: "#000",
        padding: 20,
        fontFamily: "Arial, sans-serif",
        fontSize: 11,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <img src={logo} alt="Logo" style={{ height: 36 }} />
        <div style={{ textAlign: "right" }}>
          <h2 style={{ margin: 0, fontSize: 14 }}>Cuenta Corriente</h2>
          <small>{new Date().toLocaleDateString("es-AR")}</small>
        </div>
      </div>

      <hr style={{ margin: "10px 0" }} />

      {/* CLIENTE */}
      <div style={{ marginBottom: 10 }}>
        <strong>Cliente:</strong> {cliente.nombre}
      </div>

      {/* TOTALES */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
          padding: 8,
          border: "1px solid #ccc",
          borderRadius: 4,
          fontSize: 11,
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
        style={{
          borderCollapse: "collapse",
          tableLayout: "fixed", // 🔥 CLAVE
          fontSize: 10,
        }}
      >
        <thead>
          <tr style={{ background: "#e5e7eb" }}>
            <th style={th}>Fecha</th>
            <th style={th}>Tipo</th>
            <th style={th}>Ref</th>
            <th style={{ ...th, textAlign: "right", width: "14%" }}>Debe</th>
            <th style={{ ...th, textAlign: "right", width: "14%" }}>Haber</th>
            <th style={{ ...th, textAlign: "right", width: "16%" }}>Saldo</th>
          </tr>
        </thead>

        <tbody>
          {movimientos.map((m, i) => {
            saldoAcumulado += (m.debe || 0) - (m.haber || 0);

            return (
              <tr key={i} style={{ background: i % 2 === 0 ? "#fafafa" : "#fff" }}>
                <td style={td}>{new Date(m.fecha).toLocaleDateString("es-AR")}</td>
                <td style={td}>{m.tipo}</td>
                <td style={td}>{typeof m.referencia === "string" ? m.referencia : ""}</td>
                <td style={{ ...td, textAlign: "right" }}>{m.debe ? `$${m.debe}` : ""}</td>
                <td style={{ ...td, textAlign: "right" }}>{m.haber ? `$${m.haber}` : ""}</td>
                <td style={{ ...td, textAlign: "right", fontWeight: "bold" }}>
                  ${saldoAcumulado}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* FOOTER */}
      <div style={{ marginTop: 14, textAlign: "center", fontSize: 9, color: "#666" }}>
        Documento generado automáticamente – Sistema Gomería La Sombra
      </div>
    </div>
  );
}

const th = {
  padding: "4px",
  borderBottom: "1px solid #999",
  textAlign: "left",
};

const td = {
  padding: "4px",
  borderBottom: "1px solid #ddd",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
};
