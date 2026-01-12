import logo from "../assets/logo.jpg";

export default function ReciboPagoPDF({ pago, cliente, orden }) {
  return (
    <div
      id="pdf-recibo"
      style={{
        background: "white",
        color: "#000",
        padding: 20,
        fontFamily: "Arial, sans-serif",
        fontSize: 11,
        width: "100%",
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <img src={logo} alt="Logo" style={{ height: 36 }} />
        <div style={{ textAlign: "right" }}>
          <h2 style={{ margin: 0, fontSize: 14 }}>RECIBO DE PAGO</h2>
          <div><strong>Nº {pago.numero_recibo}</strong></div>
          <small>{new Date(pago.fecha).toLocaleDateString("es-AR")}</small>
        </div>
      </div>

      <hr style={{ margin: "10px 0" }} />

      {/* CLIENTE */}
      <div style={{ marginBottom: 10 }}>
        <strong>Cliente:</strong> {cliente.nombre} {cliente.apellido || ""}
      </div>

      <div style={{ marginBottom: 10 }}>
        <strong>Orden:</strong> #{orden.id}
      </div>

      {/* MONTO */}
      <div
        style={{
          border: "1px solid #000",
          padding: 10,
          fontSize: 14,
          marginBottom: 12,
        }}
      >
        <strong>Monto recibido:</strong> ${Number(pago.monto).toLocaleString("es-AR")}
      </div>

      {/* METODO */}
      <div style={{ marginBottom: 10 }}>
        <strong>Método de pago:</strong> {pago.metodo_pago}
      </div>

      {pago.banco && (
        <div style={{ marginBottom: 4 }}>
          <strong>Banco:</strong> {pago.banco}
        </div>
      )}

      {pago.numero_cheque && (
        <div style={{ marginBottom: 4 }}>
          <strong>N° Cheque:</strong> {pago.numero_cheque}
        </div>
      )}

      {/* FIRMA */}
      <div style={{ marginTop: 40 }}>
        <div>___________________________</div>
        <div>Firma y aclaración</div>
      </div>

      {/* FOOTER */}
      <div style={{ marginTop: 20, textAlign: "center", fontSize: 9, color: "#666" }}>
        Recibo generado automáticamente – Sistema Gomería La Sombra
      </div>
    </div>
  );
}
