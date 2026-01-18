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

/* HELPERS (Fuera del componente) */
const formatMoney = (v) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
    }).format(Number(v) || 0);

const getRangoMes = (mes) => {
    const [y, m] = mes.split("-");
    const desde = `${y}-${m}-01`;
    const ultimoDia = new Date(y, Number(m), 0).getDate();
    const hasta = `${y}-${m}-${String(ultimoDia).padStart(2, "0")}`;
    return { desde, hasta };
};

const normalizarMetodo = (m) => {
    if (Array.isArray(m))
        return m[0]?.toLowerCase().replace(/\s+/g, "_") || "sin_metodo";
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

    const [modoFiltro, setModoFiltro] = useState("mes");
    const [fechaDia, setFechaDia] = useState("");
    const [mes, setMes] = useState("2026-01"); 
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    
    const COLORS = ['#10b981', '#3b82f6'];

    const getRango = () => {
        if (modoFiltro === "dia" && fechaDia) return { desde: fechaDia, hasta: fechaDia };
        if (modoFiltro === "mes" && mes) return getRangoMes(mes);
        if (modoFiltro === "rango" && fechaDesde && fechaHasta) return { desde: fechaDesde, hasta: fechaHasta };
        return getRangoMes(mes);
    };

    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            const { desde, hasta } = getRango();
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
                const bajoStock = listaProd.filter(p => Number(p.stock) <= 5 && Number(p.stock) >= 0);
                setProductosBajoStock(bajoStock);
            } catch (e) {
                console.error("Error cargando dashboard:", e);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [modoFiltro, fechaDia, mes, fechaDesde, fechaHasta]);

    if (loading) return <MainLayout><div className="p-10 text-white">Cargando métricas...</div></MainLayout>;

    /* --- CÁLCULOS FILTRADOS --- */
    const ordenesActivas = ordenes.filter(o => o.estado !== 'anulado');
    const totalOrdenes = ordenesActivas.length;
    const totalFacturado = ordenesActivas.reduce((a, o) => a + Number(o.total || 0), 0);

    const pagosValidos = pagos.filter((p) => {
        const pagoAnulado = p.anulado === true || p.anulado === 1;
        const ordenAnulada = p.orden_trabajo?.estado === 'anulado';
        return !pagoAnulado && !ordenAnulada;
    });

    const totalCobrado = pagosValidos.reduce((a, p) => a + Number(p.monto || 0), 0);
    const totalGastos = gastos.reduce((a, g) => a + Number(g.monto || 0), 0);
    const saldoPendiente = totalFacturado - totalCobrado;
    const resultadoReal = totalCobrado - totalGastos;

    /* --- LÓGICA DEL GRÁFICO (Dentro del componente) --- */
    const dataGrafico = ordenesActivas.reduce((acc, orden) => {
        (orden.items || []).forEach(item => {
            const tipo = item.tipo === 'producto' ? 'Productos' : 'Servicios';
            const monto = Number(item.precio_total || item.subtotal || 0);
            const target = acc.find(d => d.name === tipo);
            if (target) target.value += monto;
        });
        return acc;
    }, [
        { name: 'Productos', value: 0 },
        { name: 'Servicios', value: 0 }
    ]);

    const pagosPorMetodo = pagosValidos.reduce((acc, p) => {
        const metodo = normalizarMetodo(p.metodo_pago);
        acc[metodo] = (acc[metodo] || 0) + Number(p.monto);
        return acc;
    }, {});

    return (
        <MainLayout>
            {/* Header y Filtros */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Resumen de Negocio</h1>
                <div className="flex gap-2 bg-gray-800 p-2 rounded-lg border border-gray-700">
                    <select value={modoFiltro} onChange={(e) => setModoFiltro(e.target.value)} className="bg-gray-900 text-white border-none rounded px-2 py-1 text-sm outline-none">
                        <option value="dia">Hoy</option>
                        <option value="mes">Mes</option>
                    </select>
                    {modoFiltro === "mes" && (
                        <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className="bg-gray-900 text-white text-sm border-none rounded outline-none px-2" />
                    )}
                </div>
            </div>

            {/* ⚠️ ALERTA DE STOCK */}
            {productosBajoStock.length > 0 && (
                <div className="mb-6 w-full animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-gradient-to-r from-red-900/40 to-orange-900/20 border-l-4 border-red-500 p-5 rounded-r-xl shadow-2xl">
                        <h2 className="text-red-400 font-black text-lg mb-4">⚠️ REPOSICIÓN NECESARIA</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            {productosBajoStock.map(p => (
                                <div key={p.id} className="bg-gray-900/80 border border-red-500/30 p-3 rounded-lg flex justify-between items-center">
                                    <span className="text-gray-200 text-sm truncate">{p.nombre}</span>
                                    <span className="bg-red-600 text-white text-xs font-black px-2 py-1 rounded-md">{p.stock} UN</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 📊 CARDS PRINCIPALES */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
                <Card title="Caja Real" value={formatMoney(totalCobrado)} color="text-green-400" />
                <Card title="Gastos" value={formatMoney(totalGastos)} color="text-red-400" />
                <Card title="Utilidad" value={formatMoney(resultadoReal)} color={resultadoReal >= 0 ? "text-blue-400" : "text-orange-500"} />
                <Card title="Pendiente" value={formatMoney(saldoPendiente)} color="text-yellow-500" />
            </div>

            {/* SECCIÓN INTERMEDIA: GRÁFICO Y MÉTODOS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* GRÁFICO DE TORTA */}
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                    <h2 className="text-lg font-bold text-white mb-6 border-l-4 border-purple-500 pl-3">
                        Ventas: Productos vs Servicios
                    </h2>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={dataGrafico} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {dataGrafico.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} formatter={(v) => formatMoney(v)} />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* INGRESOS POR MÉTODO */}
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                    <h2 className="text-lg font-bold text-white mb-4 border-l-4 border-green-500 pl-3">Ingresos por Método</h2>
                    <div className="space-y-3">
                        {Object.entries(pagosPorMetodo).map(([metodo, total]) => (
                            <div key={metodo} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg">
                                <span className="text-gray-300">{formatMetodoPago(metodo)}</span>
                                <span className="text-white font-mono font-bold">{formatMoney(total)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RESUMEN OPERATIVO FINAL */}
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                <h2 className="text-lg font-bold text-white mb-4 border-l-4 border-blue-500 pl-3">Ventas Totales (Auditadas)</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-800 rounded-lg text-center">
                        <p className="text-gray-400 text-xs uppercase tracking-wider">Órdenes Activas</p>
                        <p className="text-2xl font-bold text-white">{totalOrdenes}</p>
                    </div>
                    <div className="p-4 bg-gray-800 rounded-lg text-center">
                        <p className="text-gray-400 text-xs uppercase tracking-wider">Total Facturado</p>
                        <p className="text-xl font-bold text-white">{formatMoney(totalFacturado)}</p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}