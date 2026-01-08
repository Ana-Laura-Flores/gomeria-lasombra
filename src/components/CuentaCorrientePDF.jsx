import logo from "../assets/logo.jpg";

export default function CuentaCorrientePDF({ cliente, movimientos }) {
  let saldoAcumulado = 0;

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <img
          src={logo}
          alt="Logo"
          className="h-9 max-w-full object-contain"
        />

        <div className="text-right flex-1">
          <h2 className="m-0 text-sm sm:text-base font-semibold">
            Cuenta Corriente
          </h2>
          <small className="text-gray-600">
            {new Date().toLocaleDateString("es-AR")}
          </small>
        </div>
      </div>

      <hr className="my-3 border-gray-300" />

      {/* CLIENTE */}
      <div className="mb-3 text-xs sm:text-sm">
        <strong>Cliente:</strong> {cliente.nombre}
      </div>

      {/* TOTALES */}
      <div
        className="
          mb-4 p-3
          border border-gray-300 rounded-md
          flex flex-wrap gap-3
          text-xs sm:text-sm
        "
      >
        <div className="flex-1 min-w-[90px]">
          <div className="text-gray-500">Total</div>
          <strong>${cliente.total}</strong>
        </div>
        <div className="flex-1 min-w-[90px]">
          <div className="text-gray-500">Pagado</div>
          <strong>${cliente.pagado}</strong>
        </div>
        <div className="flex-1 min-w-[90px]">
          <div className="text-gray-500">Saldo</div>
          <strong>${cliente.saldo}</strong>
        </div>
      </div>

      {/* TABLA */}
      <div className="w-full overflow-x-auto">
        <table className="w-full table-fixed border-collapse text-[10px] sm:text-[11px]">
          <thead>
  <tr className="bg-gray-200">
    <th className="px-2 py-1 text-left">Fecha</th>
    <th className="px-2 py-1 text-left">Tipo</th>
    <th className="px-2 py-1 text-left">Ref</th>
    <th className="px-2 py-1 text-right">Debe</th>
    <th className="px-2 py-1 text-right">Haber</th>
    <th className="px-2 py-1 text-right">Saldo</th>
  </tr>
</thead>


          <tbody>
            {movimientos.map((m, i) => {
              saldoAcumulado += (m.debe || 0) - (m.haber || 0);

              return (
                <tr
                  key={i}
                  className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="td">
                    {new Date(m.fecha).toLocaleDateString("es-AR")}
                  </td>
                  <td className="td">{m.tipo}</td>
                  <td className="td">
                    {typeof m.referencia === "string" ? m.referencia : ""}
                  </td>
                  <td className="td text-right">
                    {m.debe ? `$${m.debe}` : ""}
                  </td>
                  <td className="td text-right">
                    {m.haber ? `$${m.haber}` : ""}
                  </td>
                  <td className="td text-right font-bold">
                    ${saldoAcumulado}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="mt-4 text-center text-[9px] sm:text-[10px] text-gray-500">
        Documento generado automáticamente – Sistema Gomería La Sombra
      </div>
    </div>
  );
}
