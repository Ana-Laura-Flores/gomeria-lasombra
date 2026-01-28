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

    const handlePrint = () => window.print();

    if (loading) return <MainLayout><div className="p-10 text-white uppercase font-black animate-pulse">Cargando métricas...</div></MainLayout>;

    return (
        <MainLayout>
            {/* Estilos para impresión */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    nav, button, select, input, .no-print { display: none !important; }
                    body { background: white !important; color: black !important; padding: 0 !important; }
                    .print-only { display: block !important; }
                    .main-content { margin: 0 !important; padding: 0 !important; }
                }
                .print-only { display: none; }
            `}} />

            {/* CONTENIDO PARA PANTALLA (no-print) */}
            <div className="no-print">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Dashboard de Gestión</h1>
                        <p className="text-gray-500 text-[10px] font-black uppercase mt-1">Gomería La Sombra</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 items-center bg-gray-800 p-2 rounded-xl border border-gray-700">
                        <select
                            value={modoFiltro}
                            onChange={(e) => setModoFiltro(e.target.value)}
                            className="bg-transparent text-white text-xs font-bold uppercase outline-none cursor-pointer px-2"
                        >
                            <option value="dia">Hoy</option>
                            <option value="mes">Mes</option>
                            <option value="rango">Rango</option>
                        </select>
                        {modoFiltro === "dia" && <input type="date" value={fechaDia} onChange={(e) => setFechaDia(e.target.value)} className="bg-transparent text-white text-xs outline-none" />}
                        {modoFiltro === "mes" && <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className="bg-transparent text-white text-xs outline-none" />}
                        
                        <button onClick={handlePrint} className="ml-4 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg font-black uppercase text-[10px] transition-all shadow-lg">
                            Imprimir Caja
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card title="Ingresos (Caja)" value={formatMoney(totalCobrado)} color="text-green-400" />
                    <Card title="Gastos" value={formatMoney(totalGastos)} color="text-red-400" />
                    <Card title="Neto" value={formatMoney(totalCobrado - totalGastos)} color="text-blue-400" />
                    <Card title="Pendiente" value={formatMoney(totalFacturado - totalCobrado)} color="text-yellow-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                        <h2 className="text-white text-xs font-black uppercase mb-6 border-l-4 border-green-500 pl-3">Cobros por Método</h2>
                        <div className="space-y-2">
                            {Object.entries(pagosPorMetodo).map(([m, t]) => (
                                <div key={m} className="flex justify-between p-3 bg-gray-800/40 rounded-xl border border-gray-700/50">
                                    <span className="text-gray-400 text-sm">{formatMetodoPago(m)}</span>
                                    <span className="text-white font-bold font-mono">{formatMoney(t)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 text-center flex flex-col justify-center">
                        <p className="text-gray-500 text-[10px] font-black uppercase">Órdenes Realizadas</p>
                        <p className="text-5xl font-black text-white my-2">{ordenesActivas.length}</p>
                    </div>
                </div>
            </div>

            {/* VISTA DE IMPRESIÓN (Solo visible al imprimir) */}
            <div className="print-only text-black p-4 bg-white">
                <div className="text-center border-b-2 border-black mb-6 pb-4">
                    <h1 className="text-2xl font-bold uppercase">Gomería La Sombra</h1>
                    <p className="text-sm font-bold uppercase">Reporte de Caja</p>
                    <p className="text-xs italic">{getRango().desde} al {getRango().hasta}</p>
                </div>

                {/* Resumen Valores */}
                <div className="grid grid-cols-3 gap-2 mb-6 text-center">
                    <div className="border border-black p-2">
                        <p className="text-[9px] font-bold uppercase">Facturado</p>
                        <p className="text-lg font-black">{formatMoney(totalFacturado)}</p>
                    </div>
                    <div className="border border-black p-2 bg-gray-100">
                        <p className="text-[9px] font-bold uppercase">Cobrado (Caja)</p>
                        <p className="text-lg font-black">{formatMoney(totalCobrado)}</p>
                    </div>
                    <div className="border border-black p-2">
                        <p className="text-[9px] font-bold uppercase">Gastos</p>
                        <p className="text-lg font-black">{formatMoney(totalGastos)}</p>
                    </div>
                </div>

                {/* Tabla Ordenes */}
                <h3 className="font-bold text-[10px] uppercase border-b border-black mb-2">Detalle de Ventas</h3>
                <table className="w-full text-[9px] mb-6 border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border border-black">
                            <th className="p-1 text-left border border-black">Fecha</th>
                            <th className="p-1 text-left border border-black">Cliente</th>
                            <th className="p-1 text-right border border-black">Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ordenesActivas.map(o => (
                            <tr key={o.id}>
                                <td className="p-1 border border-black">{o.fecha}</td>
                                <td className="p-1 border border-black uppercase">{o.cliente?.nombre || 'Mostrador'}</td>
                                <td className="p-1 border border-black text-right">{formatMoney(o.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Tabla Gastos */}
                {gastos.length > 0 && (
                    <>
                        <h3 className="font-bold text-[10px] uppercase border-b border-black mb-2">Detalle de Gastos</h3>
                        <table className="w-full text-[9px] mb-6 border-collapse border border-black">
                            <tbody>
                                {gastos.map(g => (
                                    <tr key={g.id}>
                                        <td className="p-1 border border-black">{g.descripcion}</td>
                                        <td className="p-1 border border-black text-right">{formatMoney(g.monto)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}

                <div className="border-2 border-black p-4 mt-10">
                    <div className="flex justify-between text-xl font-black italic">
                        <span>SOBRANTE FINAL EN CAJA:</span>
                        <span>{formatMoney(totalCobrado - totalGastos)}</span>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}