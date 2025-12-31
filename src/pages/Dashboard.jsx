import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
  getDashboardOrdenes,
  getGastosPorMes,
  getPagosPorMes,
} from "../services/api";
import Card from "../components/Card";

/* =====================
   HELPERS
===================== */

const formatMoney = (v) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(Number(v) || 0);

const startOfDay = (d) => `${d}T00:00:00`;
const endOfDay = (d) => `${d}T23:59:59`;

const getRangoPorTipo = (tipo, valor) => {
  if (tipo === "dia") {
    return {
      desde: startOfDay(valor),
      hasta: endOfDay(valor),
    };
  }

  if (tipo === "mes") {
    const [y, m] = valor.split("-");
    const ultimoDia = new Date(y, Number(m), 0).getDate();

    return {
      desde: startOfDay(`${y}-${m}-01`),
      hasta: endOfDay(`${y}-${m}-${String(ultimoDia).padStart(2, "0")}`),
    };
  }

  // rango personalizado
  return {
    desde: startOfDay(valor.desde),
    hasta: endOfDay(valor.hasta),
  };
};

const normalizarMetodo = (m) => {
  if (Array.isArray(m)) {
    return m[0]?.toLowerCase().replace(/\s+/g, "_") || "sin_metodo";
  }
  return m?.toLowerCase().replace(/\s+/g, "_") || "sin_metodo";
};

const formatMetodoPago = (m) =>
  m.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

/* =====================
   DASHBOARD
===================== */

export default function Dashboard() {
  const [ordenes, setOrdenes] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [pagos, setPagos] = useState([]);

  const [filtro, setFiltro] = useState({
    tipo: "mes", // dia | mes | rango
    valor: new Date().toISOString().slice(0, 7), // YYYY-MM
  });

  const [loading, setLoading] = useState(true);
  const [rango, setRango] = useState({ desde: "", hasta: "" });

  /* =====================
     CARGA DATOS
  ===================== */

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);

      const { desde, hasta } = getRangoPorTipo(filtro.tipo, filtro.valor);
      setRango({ desde, hasta });

      try {
        const [oRes, gRes, pRes] = await Promise.all([
          getDashboardOrdenes(desde.slice(0, 10), hasta.slice(0, 10)),
          getGastosPorMes(desde, hasta),
          getPagosPorMes(desde, hasta),
        ]);

        setOrdenes(oRes.data || []);
        setGastos(gRes.data || []);
        setPagos(pRes.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [filtro]);

  if (loading) return <MainLayout>Cargando…</MainLayout>;

  /* =====================
     CÁLCULOS
  ===================== */

  const totalOrdenes = ordenes.length;

  const totalFacturado = ordenes.reduce(
    (a, o) => a + Number(o.total || 0),
    0
  );

  const totalCobrado = pagos.reduce(
    (a, p) => a + Number(p.monto || 0),
    0
  );

  const diferenciaFacturacionCobros = totalFacturado - totalCobrado;

  const ordenesConDeuda = ordenes.filter(
    (o) => Number(o.saldo || 0) > 0
  ).length;

  const ordenesPagadas = ordenes.filter(
    (o) => Number(o.saldo || 0) === 0 && Number(o.total) > 0
  ).length;

  const totalGastos = gastos.reduce(
    (a, g) => a + Number(g.monto || 0),
    0
  );

  const resultado = totalCobrado - totalGastos;

  const pagosPorMetodo = pagos.reduce((acc, p) => {
    const metodo = normalizarMetodo(p.metodo_pago);
    acc[metodo] = (acc[metodo] || 0) + Number(p.monto || 0);
    return acc;
  }, {});

  const gastosPorMetodo = gastos.reduce((acc, g) => {
    const metodo = normalizarMetodo(g.metodo_pago);
    acc[metodo] = (acc[metodo] || 0) + Number(g.monto || 0);
    return acc;
  }, {});

  /* =====================
     RENDER
  ===================== */

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* FILTRO */}
      <div className="flex gap-4 mb-6">
        <select
          value={filtro.tipo}
          onChange={(e) =>
            setFiltro({ ...filtro, tipo: e.target.value })
          }
          className="border px-3 py-1"
        >
          <option value="dia">Día</option>
          <option value="mes">Mes</option>
          <option value="rango">Rango</option>
        </select>

        {filtro.tipo === "dia" && (
          <input
            type="date"
            onChange={(e) =>
              setFiltro({ tipo: "dia", valor: e.target.value })
            }
            className="border px-3 py-1"
          />
        )}

        {filtro.tipo === "mes" && (
          <input
            type="month"
            value={filtro.valor}
            onChange={(e) =>
              setFiltro({ tipo: "mes", valor: e.target.value })
            }
            className="border px-3 py-1"
          />
        )}

        {filtro.tipo === "rango" && (
          <>
            <input
              type="date"
              onChange={(e) =>
                setFiltro({
                  tipo: "rango",
                  valor: { ...filtro.valor, desde: e.target.value },
                })
              }
              className="border px-3 py-1"
            />
            <input
              type="date"
              onChange={(e) =>
                setFiltro({
                  tipo: "rango",
                  valor: { ...filtro.valor, hasta: e.target.value },
                })
              }
              className="border px-3 py-1"
            />
          </>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Mostrando desde {rango.desde.slice(0, 10)} hasta{" "}
        {rango.hasta.slice(0, 10)}
      </p>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Total de órdenes" value={totalOrdenes} />
        <Card title="Órdenes con deuda" value={ordenesConDeuda} />
        <Card title="Órdenes pagadas" value={ordenesPagadas} />
        <Card title="Total facturado" value={formatMoney(totalFacturado)} />
        <Card title="Ingresos cobrados" value={formatMoney(totalCobrado)} />
        <Card
          title="Diferencia facturación vs cobros"
          value={formatMoney(diferenciaFacturacionCobros)}
        />
      </div>

      {/* INGRESOS */}
      <h2 className="text-xl font-bold mt-10 mb-4">
        Ingresos por método de pago
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Object.entries(pagosPorMetodo).map(([metodo, total]) => (
          <Card
            key={metodo}
            title={`Ingresos ${formatMetodoPago(metodo)}`}
            value={formatMoney(total)}
          />
        ))}
      </div>

      {/* GASTOS */}
      <h2 className="text-xl font-bold mt-10 mb-4">Gastos del período</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Total gastos" value={formatMoney(totalGastos)} />
        <Card title="Resultado del período" value={formatMoney(resultado)} />
      </div>

      <h2 className="text-xl font-bold mt-10 mb-4">
        Gastos por método de pago
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Object.entries(gastosPorMetodo).map(([metodo, total]) => (
          <Card
            key={metodo}
            title={`Gastos ${formatMetodoPago(metodo)}`}
            value={formatMoney(total)}
          />
        ))}
      </div>
    </MainLayout>
  );
}
