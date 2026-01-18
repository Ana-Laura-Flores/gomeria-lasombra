import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
    getDashboardOrdenes,
    getGastosPorMes,
    getPagosPorMes,
    getStockDashboard,
} from "../services/api";
import Card from "../components/Card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

/* --- HELPERS --- */
const formatMoney = (v) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
    }).format(Number(v) || 0);

const getRangoMes = (mes) => {
    if (!mes) return { desde: "", hasta: "" };
    const [y, m] = mes.split("-");
    const desde = `${y}-${m}-01`;
    const ultimoDia = new Date(y, Number(m), 0).getDate();
    const hasta = `${y}-${m}-${String(ultimoDia).padStart(2, "0")}`;
    return { desde, hasta };
};

const normalizarMetodo = (m) => {
    if (Array.isArray(m)) return m[0]?.toLowerCase().replace(/\s+/g, "_") || "sin_metodo";
    return m?.toLowerCase().replace(/\s+/g, "_") || "sin_metodo";
};

const formatMetodoPago = (m) => {
    if (!m) return "Sin método";
    return m.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

export default function Dashboard() {
    const [ordenes, setOrdenes] = useState([]);
    const [gastos, setGastos] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [productosBajoStock, setProductosBajoStock] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados de filtros originales
    const [modoFiltro, setModoFiltro] = useState("mes");
    const [fechaDia, setFechaDia] = useState(new Date().toISOString().split('T')[0]);
    const [mes, setMes] = useState("2026-01"); 
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");

    const COLORS = ['#10b981', '#3b82f6'];

    const getRango = () => {
        if (modoFiltro === "dia" && fechaDia) return { desde: fechaDia, hasta: fechaDia };
        if (modoFiltro === "mes" && mes) return getRangoMes(mes);
        if (modoFiltro === "rango" && fechaDesde && fechaHasta) return { desde: fechaDesde, hasta: fechaHasta };
        // Fallback por defecto
        return getRangoMes(mes);
    };

    useEffect(() => {
        const cargar = async () => {
            const { desde, hasta } = getRango();
            if (!desde || !hasta) return; // Evita llamadas sin fechas válidas

            setLoading(true);
            try {
                const [oRes, gRes, pRes, prodRes] = await Promise.all([
                    getDashboardOrdenes(desde, hasta),
                    getGastosPorMes(desde, hasta),
                    getPagosPorMes(desde, hasta),
                    getStockDashboard(),
                ]);

                setOrdenes(oRes.data || []);
                setGastos(gRes.data || []);
                setPagos(pRes.data || []);

                const listaProd = prodRes.data?.data || prodRes.data || [];
                setProductosBajoStock(listaProd.filter(p => Number(p.stock) <= 5));
            } catch (e) {
                console.error("Error en Dashboard:", e);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [modoFiltro, fechaDia, mes, fechaDesde, fechaHasta]);

    if (loading) return <MainLayout><div className="p-10 text-white">Cargando métricas...</div></MainLayout>;

    /* --- PROCESAMIENTO DE DATOS --- */
    const ordenesActivas = ordenes.filter(o => o.estado !== 'anulado');
    const totalFacturado = ordenesActivas.reduce((a, o) => a + Number(o.total || 0), 0);

    const pagosValidos = pagos.filter((p) => {
        const pagoAnulado = p.anulado === true || p.anulado === 1;
        const ordenAnulada = p.orden_trabajo?.estado === 'anulado';
        return !pagoAnulado && !ordenAnulada;
    });

    const totalCobrado = pagosValidos.reduce((a, p) => a + Number(p.monto || 0), 0);
    const totalGastos = gastos.reduce((a, g) => a + Number(g.monto || 0), 0);

    const dataGrafico = ordenesActivas.reduce((acc, orden) => {
        (orden.items || []).forEach(item => {
            const tipo = item.tipo === 'producto' ? 'Productos' : 'Servicios';
            const monto = Number(item.precio_total || 0);
            const target = acc.find(d => d.name === tipo);
            if (target) target.value += monto;
        });
        return acc;
    }, [{ name: 'Productos', value: 0 }, { name: 'Servicios', value: 0 }]);

    const pagosPorMetodo = pagosValidos.reduce((acc, p) => {
        const metodo = normalizarMetodo(p.metodo_pago);
        acc[metodo] = (acc[metodo] || 0) + Number(p.monto);
        return acc;
    }, {});

    return (
        <MainLayout>
            {/* Header y Filtros (ESTILO ORIGINAL) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-white">Resumen de Negocio</h1>
                
                <div className="flex flex-wrap gap-2 bg-gray-800 p-2 rounded-lg border border-gray-700">
                    <select
                        value={modoFiltro}
                        onChange={(e) => setModoFiltro(e.target.value)}
                        className="bg-gray-900 text-white border-none rounded px-3 py-1 text-sm outline-none"
                    >
                        <option value="dia">Hoy</option>
                        <option value="mes">Mes</option>
                        <option value="rango">Rango</option>
                    </select>

                    {modoFiltro === "dia" && (
                        <input type="date" value={fechaDia} onChange={(e) => setFechaDia(e.target.value)}
                            className="bg-gray-900 text-white text-sm rounded px-2 outline-none border border-gray-700" />
                    )}

                    {modoFiltro === "mes" && (
                        <input type="month" value={mes} onChange={(e) => setMes(e.target.value)}
                            className="bg-gray-900 text-white text-sm rounded px-2 outline-none border border-gray-700" />
                    )}

                    {modoFiltro === "rango" && (
                        <div className="flex gap-2">
                            <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)}
                                className="bg-gray-900 text-white text-sm rounded px-2 outline-none border border-gray-700" />
                            <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)}
                                className="bg-gray-900 text-white text-sm rounded px-2 outline-none border border-gray-700" />
                        </div>
                    )}
                </div>
            </div>

            {/* Alertas de Stock */}
            {productosBajoStock.length > 0 && (
                <div className="mb-8 bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl">
                    <h2 className="text-red-400 font-bold text-sm mb-3 uppercase">⚠️ Reposición Necesaria</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {productosBajoStock.map(p => (
                            <div key={p.id} className="bg-gray-900/50 p-2 rounded border border-red-500/20 flex justify-between">
                                <span className="text-gray-300 text-xs truncate">{p.nombre}</span>
                                <span className="text-red-500 font-bold text-xs">{p.stock} UN</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Cards Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card title="Ingresos (Caja)" value={formatMoney(totalCobrado)} color="text-green-400" />
                <Card title="Gastos Totales" value={formatMoney(totalGastos)} color="text-red-400" />
                <Card title="Resultado Neto" value={formatMoney(totalCobrado - totalGastos)} color="text-blue-400" />
                <Card title="Pendiente Cobro" value={formatMoney(totalFacturado - totalCobrado)} color="text-yellow-500" />
            </div>

            {/* Gráfico y Detalle Métodos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                    <h2 className="text-white font-bold mb-6 border-l-4 border-purple-500 pl-3">Ventas: Productos vs Servicios</h2>
                    <div className="h-[280px] w-full"> 
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={dataGrafico} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" isAnimationActive={false}>
                                    {dataGrafico.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px', color: '#fff' }} formatter={(v) => formatMoney(v)} />
                                <Legend iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                    <h2 className="text-white font-bold mb-6 border-l-4 border-green-500 pl-3">Cobros por Método</h2>
                    <div className="space-y-3">
                        {Object.entries(pagosPorMetodo).map(([metodo, total]) => (
                            <div key={metodo} className="flex justify-between items-center bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                                <span className="text-gray-300">{formatMetodoPago(metodo)}</span>
                                <span className="text-white font-bold font-mono">{formatMoney(total)}</span>
                            </div>
                        ))}
                        {Object.keys(pagosPorMetodo).length === 0 && <p className="text-gray-500 text-center py-4">No hay cobros en este periodo</p>}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}