export default function EstadoPagosBadge({ estado }) {
  const colors = {
    pendiente: "bg-yellow-600",
    seña: "bg-blue-600",
    pagado: "bg-green-600",
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs capitalize ${
        colors[estado] || "bg-gray-600"
      }`}
    >
      {estado}
    </span>
  );
}
