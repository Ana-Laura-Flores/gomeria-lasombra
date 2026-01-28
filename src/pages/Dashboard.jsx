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
    if (!m) return "sin_metodo";
    if (Array.isArray(m)) m = m[0];
    return String(m).toLowerCase().trim().replace(/\s+/g, "_");
};

const formatMetodoPago = (m) => {
    if (!m || m === "sin_metodo") return "Otros / No especificado";
    return String(m).replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
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

    if (loading) return <MainLayout><div className="p-10 text-white font-black animate-pulse text-center">CARGANDO MÉTRICAS...</div></MainLayout>;

    /* --- LÓGICA DE CÁLCULO --- */
    const ordenesActivas = ordenes.filter(o => {
        const valorEstado = String(o.estado || "").toLowerCase().trim();
        return valorEstado !== 'anulado' && valorEstado !== 'anulada' && valorEstado !== 'archived';
    });

    const totalFacturado = ordenesActivas.reduce((a, o) => a + Number(o.total || 0), 0);

    const pagosValidos = pagos.filter((p) => {
        const pagoAnulado = p.anulado === true || p.anulado === 1;
        const estadoOrden = String(p.orden_trabajo?.estado || "").toLowerCase().trim();
        return !pagoAnulado && estadoOrden !== 'anulado' && estadoOrden !== 'anulada';
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
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    nav, aside, button, select, input, .no-print { display: none !important; }
                    body { background: white !important; color: black !important; padding: 0 !important; margin: 0 !important; }
                    .print-only { display: block !important; padding: 40px !important; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #333 !important; padding: 8px; text-align: left; font-size: 11px; color: black !important; }
                    th { background-color: #f2f2f2 !important; }
                    .text-right { text-align: right; }
                    .font-bold { font-weight: bold; }
                }
                .print-only { display: none; }
            `}} />

            {/* HEADER INTERFAZ */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 no-print">
                <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Caja y Dashboard</h1>
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex bg-gray-800 p-2 rounded-lg border border-gray-700">
                        <select value={modoFiltro} onChange={(e) => setModoFiltro(e.target.value)} className="bg-gray-900 text-white border-none rounded px-3 py-1 text-sm outline-none cursor-pointer">
                            <option value="dia">Hoy</option>
                            <option value="mes">Mes</option>
                            <option value="rango">Rango</option>
                        </select>
                        {modoFiltro === "dia" && <input type="date" value={fechaDia} onChange={(e) => setFechaDia(e.target.value)} className="bg-gray-900 text-white text-sm rounded px-2 outline-none ml-2" />}
                        {modoFiltro === "mes" && <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className="bg-gray-900 text-white text-sm rounded px-2 outline-none ml-2" />}
                        {modoFiltro === "rango" && (
                            <div className="flex gap-2 ml-2">
                                <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="bg-gray-900 text-white text-sm rounded px-2 outline-none w-32" />
                                <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="bg-gray-900 text-white text-sm rounded px-2 outline-none w-32" />
                            </div>
                        )}
                    </div>
                    <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-black uppercase text-xs shadow-lg">
                        🖨️ Imprimir Reporte Caja
                    </button>
                </div>
            </div>

            {/* CARDS INTERFAZ */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 no-print">
                <Card title="Ingresos (Caja)" value={formatMoney(totalCobrado)} color="text-green-400" />
                <Card title="Gastos Totales" value={formatMoney(totalGastos)} color="text-red-400" />
                <Card title="Resultado Neto" value={formatMoney(totalCobrado - totalGastos)} color="text-blue-400" />
                <Card title="Pendiente Cobro" value={formatMoney(totalFacturado - totalCobrado)} color="text-yellow-500" />
            </div>

            {/* TABLA DESGLOSE INTERFAZ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 no-print">
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
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                    <h2 className="text-white font-bold mb-6 border-l-4 border-blue-500 pl-3 uppercase text-sm">Estadísticas Rápidas</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
                            <span className="text-gray-400">Total Órdenes</span>
                            <span className="text-2xl font-bold text-white">{ordenesActivas.length}</span>
                        </div>
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
                            <span className="text-gray-400">Monto Facturado</span>
                            <span className="text-xl font-bold text-white">{formatMoney(totalFacturado)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECCIÓN PARA IMPRESIÓN PDF --- */}
            <div className="print-only">
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '24px', margin: 0 }}>GOMERÍA LA SOMBRA</h1>
                    <h2 style={{ fontSize: '16px', margin: '5px 0' }}>REPORTE DE CIERRE DE CAJA</h2>
                    <p style={{ fontSize: '12px' }}>Período: <b>{getRango().desde}</b> al <b>{getRango().hasta}</b></p>
                </div>

                <h3 className="font-bold" style={{ borderBottom: '1px solid black', marginBottom: '10px' }}>1. RESUMEN FINANCIERO</h3>
                <table>
                    <thead>
                        <tr>
                            <th>CONCEPTO</th>
                            <th className="text-right">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>TOTAL COBRADO (Entradas)</td><td className="text-right font-bold">{formatMoney(totalCobrado)}</td></tr>
                        <tr><td>TOTAL GASTOS (Salidas)</td><td className="text-right">{formatMoney(totalGastos)}</td></tr>
                        <tr style={{ fontSize: '14px', background: '#f9f9f9' }}>
                            <td className="font-bold">SALDO NETO EN CAJA</td>
                            <td className="text-right font-bold">{formatMoney(totalCobrado - totalGastos)}</td>
                        </tr>
                        <tr><td>FACTURACIÓN TOTAL (Órdenes)</td><td className="text-right">{formatMoney(totalFacturado)}</td></tr>
                        <tr><td>PENDIENTE DE COBRO (Cta. Cte.)</td><td className="text-right" style={{ color: 'red' }}>{formatMoney(totalFacturado - totalCobrado)}</td></tr>
                    </tbody>
                </table>

                <h3 className="font-bold" style={{ borderBottom: '1px solid black', marginBottom: '10px', marginTop: '30px' }}>2. DETALLE DE INGRESOS POR MÉTODO</h3>
                <table>
                    <thead>
                        <tr>
                            <th>MÉTODO DE PAGO</th>
                            <th className="text-right">MONTO COBRADO</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(pagosPorMetodo).map(([met, total]) => (
                            <tr key={met}>
                                <td>{formatMetodoPago(met)}</td>
                                <td className="text-right font-bold">{formatMoney(total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h3 className="font-bold" style={{ borderBottom: '1px solid black', marginBottom: '10px', marginTop: '30px' }}>3. DETALLE DE GASTOS</h3>
                {gastos.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>DESCRIPCIÓN</th>
                                <th className="text-right">MONTO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gastos.map(g => (
                                <tr key={g.id}>
                                    <td>{g.descripcion}</td>
                                    <td className="text-right">{formatMoney(g.monto)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p>No se registraron gastos en este período.</p>}

                <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ borderTop: '1px solid black', width: '200px', textAlign: 'center', paddingTop: '5px' }}>Firma Responsable</div>
                    <div style={{ borderTop: '1px solid black', width: '200px', textAlign: 'center', paddingTop: '5px' }}>Control / Auditoría</div>
                </div>
                <p style={{ fontSize: '9px', marginTop: '40px', textAlign: 'right' }}>Documento generado el {new Date().toLocaleString()}</p>
            </div>
        </MainLayout>
    );
}