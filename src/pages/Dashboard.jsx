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

/* --- HELPERS (Fuera del componente) --- */
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

    const [modoFiltro, setModoFiltro] = useState("mes");
    const [fechaDia, setFechaDia] = useState("");
    const [mes, setMes] = useState("2026-01");
    
    const COLORS = ['#10b981', '#3b82f6']; // Verde para productos, Azul para servicios

    const getRango = () => {
        if (modoFiltro === "dia" && fechaDia) return { desde: fechaDia, hasta: fechaDia };
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
                setProductosBajoStock(listaProd.filter(p => Number(p.stock) <= 5));
            } catch (e) {
                console.error("Error cargando dashboard:", e);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [modoFiltro, fechaDia, mes]);

    if (loading) return <MainLayout><div className="p-10 text-white">Cargando...</div></MainLayout>;

    /* ==========================================================
       CÁLCULOS (TODOS DENTRO DEL COMPONENTE PARA EVITAR ERRORES)
    ========================================================== */
    
    // 1. Órdenes filtrando las anuladas
    const ordenesActivas = ordenes.filter(o => o.estado !== 'anulado');
    const totalFacturado = ordenesActivas.reduce((a, o) => a + Number(o.total || 0), 0);

    // 2. Pagos válidos
    const pagosValidos = pagos.filter((p) => {
        const pagoAnulado = p.anulado === true || p.anulado === 1;
        const ordenAnulada = p.orden_trabajo?.estado === 'anulado';
        return !pagoAnulado && !ordenAnulada;
    });

    const totalCobrado = pagosValidos.reduce((a, p) => a + Number(p.monto || 0), 0);
    const totalGastos = gastos.reduce((a, g) => a + Number(g.monto || 0), 0);
    const resultadoReal = totalCobrado - totalGastos;

    // 3. DATOS DEL GRÁFICO (Ahora sí tiene acceso a ordenesActivas)
    const dataGrafico = ordenesActivas.reduce((acc, orden) => {
        (orden.items || []).forEach(item => {
            const tipo = item.tipo === 'producto' ? 'Productos' : 'Servicios';
            const monto = Number(item.precio_total || 0);
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
            {/* Header / Filtros */}
            <div className="flex justify-between items-center mb-6 text-white">
                <h1 className="text-3xl font-bold">Dashboard de Gestión</h1>
                <div className="flex gap-2 bg-gray-800 p-2 rounded-lg">
                    <select value={modoFiltro} onChange={(e) => setModoFiltro(e.target.value)} className="bg-gray-900 px-2 py-1 rounded">
                        <option value="mes">Mes</option>
                        <option value="dia">Hoy</option>
                    </select>
                    {modoFiltro === "mes" && (
                        <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className="bg-gray-900 px-2 rounded" />
                    )}
                </div>
            </div>

            {/* Alerta Stock */}
            {productosBajoStock.length > 0 && (
                <div className="mb-6 bg-red-900/30 border-l-4 border-red-500 p-4 rounded text-white">
                    <h2 className="font-bold mb-2">⚠️ REPOSICIÓN URGENTE</h2>
                    <div className="flex flex-wrap gap-2">
                        {productosBajoStock.map(p => (
                            <span key={p.id} className="bg-gray-900 px-3 py-1 rounded text-sm border border-red-500/50">
                                {p.nombre}: <strong>{p.stock}</strong>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Métrica Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card title="Ingresos (Caja)" value={formatMoney(totalCobrado)} color="text-green-400" />
                <Card title="Gastos" value={formatMoney(totalGastos)} color="text-red-400" />
                <Card title="Utilidad Real" value={formatMoney(resultadoReal)} color="text-blue-400" />
                <Card title="Cta. Corriente" value={formatMoney(totalFacturado - totalCobrado)} color="text-yellow-500" />
            </div>

            {/* Gráfico y Métodos */}
           <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
    <h2 className="text-white font-bold mb-4">Ventas: Productos vs Servicios</h2>
    {/* Agregamos una altura mínima fija al div padre para que ResponsiveContainer no falle */}
    <div className="w-full h-[260px] min-h-[260px]"> 
        <ResponsiveContainer width="100%" height="100%">
            {/* Si dataGrafico no tiene valores, Recharts puede quejarse. 
                Aseguramos que siempre haya algo que renderizar. */}
            <PieChart>
                <Pie 
                    data={dataGrafico} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60} 
                    outerRadius={80} 
                    dataKey="value"
                    isAnimationActive={false} // Desactivar animación ayuda a depurar el error de tamaño inicial
                >
                    {dataGrafico.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px' }} 
                    itemStyle={{ color: '#fff' }} 
                    formatter={(v) => formatMoney(v)} 
                />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    </div>


                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 text-white">
                    <h2 className="font-bold mb-4">Ingresos por Medio</h2>
                    <div className="space-y-3">
                        {Object.entries(pagosPorMetodo).map(([metodo, total]) => (
                            <div key={metodo} className="flex justify-between bg-gray-800 p-3 rounded">
                                <span className="capitalize">{formatMetodoPago(metodo)}</span>
                                <span className="font-bold text-green-400">{formatMoney(total)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}