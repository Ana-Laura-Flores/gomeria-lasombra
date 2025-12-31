import logo from "../assets/logo.jpg";

const formatMoney = (value) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(Number(value) || 0);

export default function OrdenPrint({ orden }) {
  if (!orden) return null;

  return (
    <div
      id="orden-print"
      style={{
        width: "100%",
        maxWidth: 420,
        margin: "0 auto",
        padding: 16,
        backgroundColor: "#fff",
        color: "#000",
        fontFamily: "Arial, sans-serif",
        fontSize: 12,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{ height: 40, marginRight: 12 }}
        />
        <div>
          <strong>Gomería La Sombra</strong>
          <div>Orden de trabajo</div>
        </div>
      </div>

      {/* INFO ORDEN */}
      <div style={{ marginBottom: 12 }}>
        <div>
          <strong>Fecha:</strong>{" "}
          {new Date(orden.fecha).toLocaleDateString()}
        </div>
        <div>
          <strong>Comprobante:</strong> {orden.comprobante || "-"}
        </div>
        <div>
          <strong>Cliente:</strong>{" "}
          {orden.cliente
            ? `${orden.cliente.nombre} ${orden.cliente.apellido || ""}`
            : "-"}
        </div>
        <div>
          <strong>Patente:</strong> {orden.patente}
        </div>
        {orden.estado && (
          <div>
            <strong>Estado:</strong> {orden.estado}
          </div>
        )}
      </div>

      {/* ITEMS */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: 14,
        }}
      >
        <thead style={{ borderBottom: "1px solid #000" }}>
          <tr>
            <th style={{ textAlign: "left" }}>Ítem</th>
            <th style={{ textAlign: "right" }}>Cantidad</th>
            <th style={{ textAlign: "right" }}>Precio unit.</th>
            <th style={{ textAlign: "right" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {orden.items_orden?.map((item) => (
            <tr key={item.id}>
              <td>{item.nombre || "-"}</td>
              <td style={{ textAlign: "right" }}>{item.cantidad}</td>
              <td style={{ textAlign: "right" }}>
                {formatMoney(item.precio_unitario)}
              </td>
              <td style={{ textAlign: "right", fontWeight: "bold" }}>
                {formatMoney(item.subtotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTALES */}
      <div style={{ marginTop: 8, textAlign: "right" }}>
        <div>
          Total: <strong>{formatMoney(orden.total)}</strong>
        </div>
      </div>
    </div>
  );
}
