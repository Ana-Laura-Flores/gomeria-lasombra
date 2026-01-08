import logo from "../assets/logo.jpg";

export default function CuentaCorrientePDF({ cliente, movimientos }) {
  let saldoAcumulado = 0;

  const th = {
    padding: "6px",
    borderBottom: "1px solid #d1d5db",
    textAlign: "left",
    fontWeight: "bold",
  };

  const td = {
    padding: "4px 6px",
    borderBottom: "1px solid #e5e7eb",
  };

  return (
    <div
      id="pdf-cuenta-corriente"
      style={{
        backgroundColor: "#ffffff",
        color: "#000000",
        padding: "16px",
        fontFamily: "Arial, sans-serif",
        fontSize: "11px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{ height: 36, objectFit: "contain" }}
        />

        <div style={{ textAlign: "right", flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 14 }}>Cuenta Corriente</h2>
          <small style={{ color: "#4b5563" }}>
            {new Date().toLocaleDateString("es-AR")}
          </small>
        </div>
      </div>

      <hr
        style={{
          margin: "12px 0",
          border: "none",
          borderTop: "1px solid #d1d5db",
        }}
      />

      {/* CLIENTE */}
      <div style={{ marginBottom: 10 }}>
        <strong>Cliente:</strong> {cliente.nombre}
      </div>

      {/* TOTALES */}
      <div
        style={{
          marginBottom: 14,
          padding: 10,
          border: "1px solid #d1d5db",
          borderRadius: 6,
          display: "flex",
          gap: 12,
          fontSize: 11,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ color: "#6b7280" }}>Total</div>
          <strong>${cliente.total}</strong>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#6b7280" }}>Pagado</div>
          <strong>${cliente.pagado}</strong>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#6b7280" }}>Saldo</div>
          <strong>${cliente.saldo}</strong>
        </div>
      </div>

      {/* TABLA */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "10px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#e5e7eb" }}>
            <th style={th}>Fecha</th>
            <th style={th}>Tipo</th>
            <th style={th}>Ref</th>
            <th style={{ ...th, textAlign: "right" }}>Debe</th>
            <th style={{ ...th, textAlign: "right" }}>Haber</th>
            <th style={{ ...th, textAlign: "right" }}>Saldo</th>
          </tr>
        </thead>

        <tbody>
          {movimientos.map((m, i) => {
            saldoAcumulado += (m.debe || 0) - (m.haber || 0);

            return (
              <tr
                key={i}
                style={{
                  backgroundColor: i % 2 === 0 ? "#f9fafb" : "#ffffff",
                }}
              >
                <td style={td}>
                  {new Date(m.fecha).toLocaleDateString("es-AR")}
                </td>
                <td style={td}>{m.tipo}</td>
                <td style={td}>{m.referencia || ""}</td>
                <td style={{ ...td, textAlign: "right" }}>
                  {m.debe ? `$${m.debe}` : ""}
                </td>
                <td style={{ ...td, textAlign: "right" }}>
                  {m.haber ? `$${m.haber}` : ""}
                </td>
                <td style={{ ...td, textAlign: "right", fontWeight: "bold" }}>
                  ${saldoAcumulado}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* FOOTER */}
      <div
        style={{
          marginTop: 16,
          textAlign: "center",
          fontSize: 9,
          color: "#6b7280",
        }}
      >
        Documento generado automáticamente – Sistema Gomería La Sombra
      </div>
    </div>
  );
}
