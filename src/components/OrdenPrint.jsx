import logo from "../assets/logo.jpg";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(Number(value) || 0);

export default function OrdenPrint({ orden }) {
  if (!orden) return null;

  return (
    <div id="orden-print" style={{ width: "100%", maxWidth: 420, margin: "0 auto", padding: 16, backgroundColor: "#fff", color: "#000", fontFamily: "Arial, sans-serif", fontSize: 12 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        <img src={logo} alt="Logo" style={{ height: 40, marginRight: 12 }} />
        <div>
          <strong>Gomería La Sombra</strong>
          <div>Orden de trabajo</div>
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div><strong>Fecha:</strong> {new Date(orden.fecha).toLocaleDateString()}</div>
        <div><strong>Comprobante:</strong> {orden.comprobante || "-"}</div>
        <div><strong>Cliente:</strong> {orden.cliente?.nombre} {orden.cliente?.apellido || ""}</div>
        <div><strong>Patente:</strong> {orden.patente}</div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 14 }}>
        <thead style={{ borderBottom: "1px solid #000" }}>
          <tr>
            <th>Ítem</th>
            <th>Tipo</th>
            <th>Cantidad</th>
            <th>Precio unit.</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orden.items_orden?.map(item => (
            <tr key={item.id}>
              <td>{item.nombre}</td>
              <td>{item.tipo_item}</td>
              <td style={{ textAlign: "right" }}>{item.cantidad}</td>
              <td style={{ textAlign: "right" }}>{formatMoney(item.precio_unitario)}</td>
              <td style={{ textAlign: "right" }}>{formatMoney(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ textAlign: "right", marginTop: 8 }}>
        Total: <strong>{formatMoney(orden.total)}</strong>
      </div>
    </div>
  );
}
