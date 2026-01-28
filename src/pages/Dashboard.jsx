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

    // Filtros originales
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

    if (loading) return <MainLayout><div className="p-10 text-white font-black animate-pulse">Cargando métricas...</div></MainLayout>;

    /* --- LÓGICA DE FILTRADO --- */
    const ordenesActivas = ordenes.filter(o => {
        const valorEstado = String(o.estado || "").toLowerCase().trim();
        return valorEstado !== 'anulado' && valorEstado !== 'anulada' && valorEstado !== 'archived';
    });

    const totalOrdenes = ordenesActivas.length; 
    const totalFacturado = ordenesActivas.reduce((a, o) => a + Number(o.total || 0), 0);

    const pagosValidos = pagos.filter((p) => {
        const pagoAnulado = p.anulado === true || p.anulado === 1;
        const estadoOrdenRelacionada = String(p.orden_trabajo?.estado || "").toLowerCase().trim();
        const ordenAnulada = estadoOrdenRelacionada === 'anulado' || estadoOrdenRelacionada === 'anulada';
        return !pagoAnulado && !ordenAnulada;
    });

    const totalCobrado = pagosValidos.reduce((a, p) => a + Number(p.monto || 0), 0);
    const totalGastos = gastos.reduce((a, g) => a + Number(g.monto || 0), 0);

    const pagosPorMetodo = pagosValidos.reduce((acc, p) => {
        const metodo = normalizarMetodo(p.metodo_pago);
        acc[metodo] = (acc[metodo] || 0) + Number(p.monto);
        return acc;
    }, {});

    return (
        <MainLayout>
            {/* ESTILOS CSS PARA IMPRESIÓN */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    nav, aside, button, select, input, .no-print { display: none !important; }
                    body { background: white !important; color: black !important; padding: 0 !important; margin: 0 !important; }
                    .print-only { display: block !important; padding: 20px !important; }
                    .main-container { padding: 0 !important; }
                }
                .print-only { display: none; }
            `}} />

            {/* HEADER ORIGINAL */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 no-print">
                <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Dashboard de Gestión</h1>
                
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex bg-gray-800 p-2 rounded-lg border border-gray-700">
                        <select
                            value={modoFiltro}
                            onChange={(e) => setModoFiltro(e.target.value)}
                            className="bg-gray-900 text-white border-none rounded px-3 py-1 text-sm outline-none cursor-pointer"
                        >
                            <option value="dia">Hoy</option>
                            <option value="mes">Mes</option>
                            <option value="rango">Rango</option>
                        </select>

                        {modoFiltro === "dia" && (
                            <input type="date" value={fechaDia} onChange={(e) => setFechaDia(e.target.value)}
                                className="bg-gray-900 text-white text-sm rounded px-2 outline-none w-36" />
                        )}

                        {modoFiltro === "mes" && (
                            <input type="month" value={mes} onChange={(e) => setMes(e.target.value)}
                                className="bg-gray-900 text-white text-sm rounded px-2 outline-none w-36" />
                        )}

                        {modoFiltro === "rango" && (
                            <div className="flex gap-2">
                                <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)}
                                    className="bg-gray-900 text-white text-sm rounded px-2 outline-none w-32" />
                                <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)}
                                    className="bg-gray-900 text-white text-sm rounded px-2 outline-none w-32" />
                            </div>
                        )}
                    </div>
                    {/* Botón Agregado sin romper el diseño */}
                    <button 
                        onClick={() => window.print()}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-black uppercase text-xs transition-all shadow-lg"
                    >
                        Imprimir Caja
                    </button>
                </div>
            </div>

            {/* ALERTAS DE STOCK ORIGINALES */}
            {productosBajoStock.length > 0 && (
                <div className="mb-6 bg-red-500/10 border border-red-500/50 p-4 rounded-xl no-print">
                    <h2 className="text-red-500 font-bold text-xs uppercase mb-2 tracking-widest">⚠️ Alerta de Reposición</h2>
                    <div className="flex flex-wrap gap-2">
                        {productosBajoStock.map(p => (
                            <span key={p.id} className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded border border-red-900">
                                {p.nombre}: <b className="text-red-500">{p.stock}</b>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* CARDS ORIGINALES */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 no-print">
                <Card title="Ingresos (Caja)" value={formatMoney(totalCobrado)} color="text-green-400" />
                <Card title="Gastos Totales" value={formatMoney(totalGastos)} color="text-red-400" />
                <Card title="Resultado Neto" value={formatMoney(totalCobrado - totalGastos)} color="text-blue-400" />
                <Card title="Pendiente Cobro" value={formatMoney(totalFacturado - totalCobrado)} color="text-yellow-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 no-print">
                {/* Detalle Cobros Original */}
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                    <h2 className="text-white font-bold mb-6 border-l-4 border-green-500 pl-3 uppercase text-sm">Cobros por Método</h2>
                    <div className="space-y-3">
                        {Object.entries(pagosPorMetodo).map(([metodo, total]) => (
                            <div key={metodo} className="flex justify-between items-center bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                                <span className="text-gray-300">{formatMetodoPago(metodo)}</span>
                                <span className="text-white font-bold font-mono">{formatMoney(total)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resumen Operativo Original */}
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                    <h2 className="text-white font-bold mb-6 border-l-4 border-blue-500 pl-3 uppercase text-sm">Estadísticas</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
                            <span className="text-gray-400">Órdenes Realizadas</span>
                            <span className="text-2xl font-bold text-white">{totalOrdenes}</span>
                        </div>
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
                            <span className="text-gray-400">Monto Facturado</span>
                            <span className="text-xl font-bold text-white font-mono">{formatMoney(totalFacturado)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECCIÓN OCULTA: SOLO PARA IMPRIMIR PDF */}
            <div className="print-only text-black bg-white">
                <div className="text-center border-b-2 border-black mb-6 pb-4">
                    <h1 className="text-2xl font-bold uppercase">Gomería La Sombra</h1>
                    <p className="font-bold">CIERRE DE CAJA - {getRango().desde} al {getRango().hasta}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="border border-black p-4">
                        <p className="text-xs uppercase font-bold">Resumen de Fondos</p>
                        <p>Total Cobrado: <b>{formatMoney(totalCobrado)}</b></p>
                        <p>Total Gastos: <b>{formatMoney(totalGastos)}</b></p>
                        <p className="text-lg border-t mt-2">Saldo Caja: <b>{formatMoney(totalCobrado - totalGastos)}</b></p>
                    </div>
                    <div className="border border-black p-4">
                        <p className="text-xs uppercase font-bold">Estado de Ventas</p>
                        <p>Órdenes: <b>{totalOrdenes}</b></p>
                        <p>Facturado: <b>{formatMoney(totalFacturado)}</b></p>
                        <p>A Cobrar (Cta Cte): <b>{formatMoney(totalFacturado - totalCobrado)}</b></p>
                    </div>
                </div>

                <h3 className="font-bold text-sm uppercase border-b border-black mb-2 italic">Detalle de Órdenes</h3>
                <table className="w-full text-[10px] mb-8 border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border border-black text-left uppercase">
                            <th className="p-1 border border-black">Fecha</th>
                            <th className="p-1 border border-black">Cliente / Patente</th>
                            <th className="p-1 border border-black">Pago</th>
                            <th className="p-1 border border-black text-right">Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ordenesActivas.map(o => (
                            <tr key={o.id}>
                                <td className="p-1 border border-black">{o.fecha}</td>
                                <td className="p-1 border border-black uppercase">{o.cliente?.nombre} - {o.patente}</td>
                                <td className="p-1 border border-black">{o.condicion_cobro}</td>
                                <td className="p-1 border border-black text-right">{formatMoney(o.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {gastos.length > 0 && (
                    <>
                        <h3 className="font-bold text-sm uppercase border-b border-black mb-2 italic">Detalle de Gastos</h3>
                        <table className="w-full text-[10px] border-collapse">
                            <tbody>
                                {gastos.map(g => (
                                    <tr key={g.id}>
                                        <td className="p-1 border border-black uppercase">{g.descripcion}</td>
                                        <td className="p-1 border border-black text-right">{formatMoney(g.monto)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        </MainLayout>
    );
}