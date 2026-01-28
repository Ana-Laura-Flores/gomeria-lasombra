import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
    getDashboardOrdenes,
    getGastosPorMes,
    getPagosPorMes,
    getStockDashboard,
} from "../services/api";
import Card from "../components/Card";

/* --- HELPERS --- */
const formatMoney = (v) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
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

    const [modoFiltro, setModoFiltro] = useState("mes");
    const [fechaDia, setFechaDia] = useState(new Date().toISOString().split('T')[0]);
    const [mes, setMes] = useState("2026-01"); 
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");

    const getRango = () => {
        if (modoFiltro === "dia" && fechaDia) return { desde: fechaDia, hasta: fechaDia };
        if (modoFiltro === "mes" && mes) return getRangoMes(mes);
        if (modoFiltro === "rango" && fechaDesde && fechaHasta) return { desde: fechaDesde, hasta: fechaHasta };
        return getRangoMes(mes);
    };

    useEffect(() => {
        const cargar = async () => {
            const { desde, hasta } = getRango();
            if (modoFiltro === "rango" && (!fechaDesde || !fechaHasta)) return;

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
                console.error("Error cargando Dashboard:", e);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [modoFiltro, fechaDia, mes, fechaDesde, fechaHasta]);

    /* --- LÓGICA DE CÁLCULOS --- */
    const ordenesActivas = ordenes.filter(o => {
        const valorEstado = String(o.estado || "").toLowerCase().trim();
        return valorEstado !== 'anulado' && valorEstado !== 'anulada' && valorEstado !== 'archived';
    });

    const totalFacturado = ordenesActivas.reduce((a, o) => a + Number(o.total || 0), 0);
    
    const pagosValidos = pagos.filter((p) => {
        const pagoAnulado = p.anulado === true || p.anulado === 1;
        const estadoOrdenRelacionada = String(p.orden_trabajo?.estado || "").toLowerCase().trim();
        return !pagoAnulado && estadoOrdenRelacionada !== 'anulado' && estadoOrdenRelacionada !== 'anulada';
    });

    const totalCobrado = pagosValidos.reduce((a, p) => a + Number(p.monto || 0), 0);
    const totalGastos = gastos.reduce((a, g) => a + Number(g.monto || 0), 0);

    const pagosPorMetodo = pagosValidos.reduce((acc, p) => {
        const metodo = normalizarMetodo(p.metodo_pago);
        acc[metodo] = (acc[metodo] || 0) + Number(p.monto);
        return acc;
    }, {});

    /* --- FUNCIÓN DE IMPRESIÓN --- */
    const handlePrint = () => {
        window.print();
    };

    if (loading) return <MainLayout><div className="p-10 text-white">Cargando métricas...</div></MainLayout>;

    return (
        <MainLayout>
            {/* Estilos para impresión (Ocultar todo excepto lo necesario) */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    nav, button, select, input, .no-print { display: none !important; }
                    body { background: white !important; color: black !important; }
                    .print-only { display: block !important; }
                    .card-print { border: 1px solid black !important; color: black !important; padding: 10px !important; margin-bottom: 10px !important; }
                }
                .print-only { display: none; }
            `}} />

            {/* Header y Filtros */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 no-print">
                <div>
                    <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Dashboard de Gestión</h1>
                    <p className="text-gray-500 text-xs font-black uppercase mt-1">Gomería La Sombra</p>
                </div>
                
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex bg-gray-800 p-2 rounded-lg border border-gray-700">
                        <select
                            value={modoFiltro}
                            onChange={(e) => setModoFiltro(e.target.value)}
                            className="bg-transparent text-white text-sm outline-none cursor-pointer border-r border-gray-700 pr-2 mr-2"
                        >
                            <option value="dia">Hoy</option>
                            <option value="mes">Mes</option>
                            <option value="rango">Rango</option>
                        </select>

                        {modoFiltro === "dia" && (
                            <input type="date" value={fechaDia} onChange={(e) => setFechaDia(e.target.value)}
                                className="bg-transparent text-white text-sm outline-none" />
                        )}
                        {modoFiltro === "mes" && (
                            <input type="month" value={mes} onChange={(e) => setMes(e.target.value)}
                                className="bg-transparent text-white text-sm outline-none" />
                        )}
                        {modoFiltro === "rango" && (
                            <div className="flex gap-2 text-white">
                                <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="bg-transparent outline-none text-xs" />
                                <span>-</span>
                                <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="bg-transparent outline-none text-xs" />
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={handlePrint}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-black uppercase text-xs flex items-center gap-2 transition-all shadow-lg"
                    >
                        <span>🖨️</span> Imprimir Caja
                    </button>
                </div>
            </div>

            {/* VISTA DE IMPRESIÓN (Solo visible al imprimir) */}
            <div className="print-only text-black p-4">
                <div className="text-center border-b-2 border-black mb-6 pb-4">
                    <h1 className="text-2xl font-bold uppercase">Gomería La Sombra</h1>
                    <p className="text-sm font-bold">REPORTE DE CAJA: {getRango().desde} al {getRango().hasta}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="border border-black p-3">
                        <p className="text-xs font-bold uppercase">Ingresos Reales</p>
                        <p className="text-xl font-black">{formatMoney(totalCobrado)}</p>
                    </div>
                    <div className="border border-black p-3">
                        <p className="text-xs font-bold uppercase">Gastos</p>
                        <p className="text-xl font-black">{formatMoney(totalGastos)}</p>
                    </div>
                </div>
            </div>

            {/* Cards Métricas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 no-print">
                <Card title="Ingresos (Caja)" value={formatMoney(totalCobrado)} color="text-green-400" />
                <Card title="Gastos Totales" value={formatMoney(totalGastos)} color="text-red-400" />
                <Card title="Resultado Neto" value={formatMoney(totalCobrado - totalGastos)} color="text-blue-400" />
                <Card title="Cta. Cte. Generada" value={formatMoney(totalFacturado - totalCobrado)} color="text-yellow-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Cobros por Método */}
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 card-print">
                    <h2 className="text-white font-bold mb-6 border-l-4 border-green-500 pl-3 no-print">Cobros por Método</h2>
                    <h2 className="print-only font-bold text-sm mb-4 border-b">Detalle de Cobros</h2>
                    <div className="space-y-3">
                        {Object.entries(pagosPorMetodo).map(([metodo, total]) => (
                            <div key={metodo} className="flex justify-between items-center bg-gray-800/50 p-4 rounded-lg border border-gray-700 card-print">
                                <span className="text-gray-300 print:text-black">{formatMetodoPago(metodo)}</span>
                                <span className="text-white print:text-black font-bold font-mono">{formatMoney(total)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resumen Operativo */}
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 card-print">
                    <h2 className="text-white font-bold mb-6 border-l-4 border-blue-500 pl-3 no-print">Estadísticas</h2>
                    <h2 className="print-only font-bold text-sm mb-4 border-b">Resumen Operativo</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex justify-between items-center card-print">
                            <span className="text-gray-400 print:text-black uppercase text-xs font-bold">Órdenes Realizadas</span>
                            <span className="text-2xl font-bold text-white print:text-black">{ordenesActivas.length}</span>
                        </div>
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex justify-between items-center card-print">
                            <span className="text-gray-400 print:text-black uppercase text-xs font-bold">Total Facturado</span>
                            <span className="text-xl font-bold text-white print:text-black font-mono">{formatMoney(totalFacturado)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}