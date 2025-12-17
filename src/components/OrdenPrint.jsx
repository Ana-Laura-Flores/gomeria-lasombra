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
        maxWidth: "420px",
        margin: "0 auto",
        padding: "16px",
        backgroundColor: "#ffffff",
        color: "#000000",
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        <img src={logo} alt="Logo" style={{ height: 40, marginRight: 12 }} />
        <div>
          <strong>Gomería La Sombra</strong>
          <div>Orden de trabajo</div>
        </div>
      </div>

      {/* INFO */}
      <div style={{ marginBottom: 12 }}>
        <div><strong>Fecha:</strong> {new Date(orden.fecha).toLocaleDateString()}</div>
        <div><strong>Comprobante:</strong> {orden.comprobante_numero || "-"}</div>
        <div>
          <strong>Cliente:</strong>{" "}
          {orden.cliente
            ? `${orden.cliente.nombre} ${orden.cliente.apellido || ""}`
            : "-"}
        </div>
        <div><strong>Patente:</strong> {orden.patente}</div>
        <div><strong>Estado:</strong> {orden.estado}</div>
      </div>

      {/* ITEMS */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #000", textAlign: "left" }}>
              Servicio
            </th>
            <th style={{ borderBottom: "1px solid #000", textAlign: "right" }}>
              Precio
            </th>
          </tr>
        </thead>
        <tbody>
          {orden.items_orden?.map((item) => (
            <tr key={item.id}>
              <td style={{ padding: "4px 0" }}>
                {item.tarifa?.servicio?.nombre || "-"}
              </td>
              <td style={{ padding: "4px 0", textAlign: "right" }}>
                {formatMoney(item.subtotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTALES */}
      <div style={{ marginTop: 12, textAlign: "right" }}>
        <div>Total: <strong>{formatMoney(orden.total)}</strong></div>
        <div>Pagado: {formatMoney(orden.total_pagado)}</div>
        <div>Saldo: {formatMoney(orden.saldo)}</div>
      </div>
    </div>
  );
}
