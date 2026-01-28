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

// Limpia la fecha para que no muestre la hora (ej: 2026-01-04)
const formatSoloFecha = (str) => {
    if (!str) return "---";
    return str.includes("T") ? str.split("T")[0] : str;
};

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

    return (
        <MainLayout>
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    nav, aside, button, select, input, .no-print { display: none !important; }
                    body { background: white !important; color: black !important; }
                    .print-only { display: block !important; }
                }
                .print-only { display: none; }
            `}} />

            {/* VISTA PANTALLA */}
            <div className="no-print">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Dashboard de Gestión</h1>
                    <div className="flex flex-wrap gap-2 items-center bg-gray-800 p-2 rounded-lg border border-gray-700">
                        <select value={modoFiltro} onChange={(e) => setModoFiltro(e.target.value)} className="bg-gray-900 text-white rounded px-3 py-1 text-sm outline-none">
                            <option value="dia">Hoy</option>
                            <option value="mes">Mes</option>
                            <option value="rango">Rango</option>
                        </select>
                        {modoFiltro === "dia" && <input type="date" value={fechaDia} onChange={(e) => setFechaDia(e.target.value)} className="bg-gray-900 text-white text-sm rounded px-2 outline-none" />}
                        {modoFiltro === "mes" && <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className="bg-gray-900 text-white text-sm rounded px-2 outline-none" />}
                        <button onClick={() => window.print()} className="ml-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg font-black uppercase text-xs">
                            Imprimir Caja
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card title="Ingresos (Caja)" value={formatMoney(totalCobrado)} color="text-green-400" />
                    <Card title="Gastos Totales" value={formatMoney(totalGastos)} color="text-red-400" />
                    <Card title="Resultado Neto" value={formatMoney(totalCobrado - totalGastos)} color="text-blue-400" />
                    <Card title="Pendiente Cobro" value={formatMoney(totalFacturado - totalCobrado)} color="text-yellow-500" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                    <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 flex flex-col justify-center items-center">
                        <span className="text-gray-400 uppercase text-xs font-bold">Órdenes Realizadas</span>
                        <span className="text-6xl font-black text-white">{ordenesActivas.length}</span>
                    </div>
                </div>
            </div>

            {/* VISTA IMPRESIÓN */}
            <div className="print-only text-black bg-white p-4">
                <div className="text-center border-b-2 border-black mb-6 pb-4">
                    <h1 className="text-2xl font-bold uppercase">Gomería La Sombra</h1>
                    <p className="font-bold uppercase">Reporte de Caja</p>
                    <p className="text-xs italic">Período: {getRango().desde} al {getRango().hasta}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="border border-black p-3">
                        <p className="text-[10px] font-bold uppercase border-b mb-2">Resumen de Caja</p>
                        <div className="flex justify-between text-xs"><span>(+) Cobrado:</span> <b>{formatMoney(totalCobrado)}</b></div>
                        <div className="flex justify-between text-xs"><span>(-) Gastos:</span> <b>{formatMoney(totalGastos)}</b></div>
                        <div className="flex justify-between text-sm border-t mt-1 font-bold"><span>TOTAL CAJA:</span> <b>{formatMoney(totalCobrado - totalGastos)}</b></div>
                    </div>
                    <div className="border border-black p-3">
                        <p className="text-[10px] font-bold uppercase border-b mb-2">Estado de Ventas</p>
                        <div className="flex justify-between text-xs"><span>Órdenes:</span> <b>{ordenesActivas.length}</b></div>
                        <div className="flex justify-between text-xs"><span>Facturado:</span> <b>{formatMoney(totalFacturado)}</b></div>
                        <div className="flex justify-between text-xs text-red-600"><span>Pendiente:</span> <b>{formatMoney(totalFacturado - totalCobrado)}</b></div>
                    </div>
                </div>

                <h3 className="font-bold text-[10px] uppercase border-b border-black mb-2">Detalle de Órdenes</h3>
                <table className="w-full text-[9px] mb-6 border-collapse">
                    <thead>
                        <tr className="bg-gray-100 border border-black">
                            <th className="p-1 border border-black text-left">NRO</th>
                            <th className="p-1 border border-black text-left">FECHA</th>
                            <th className="p-1 border border-black text-left">CLIENTE</th>
                            <th className="p-1 border border-black text-left">PATENTE</th>
                            <th className="p-1 border border-black text-right">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ordenesActivas.map(o => (
                            <tr key={o.id}>
                                <td className="p-1 border border-black">#{o.id}</td>
                                <td className="p-1 border border-black">{formatSoloFecha(o.fecha)}</td>
                                <td className="p-1 border border-black uppercase">{o.cliente?.nombre || o.cliente_nombre || 'Mostrador'}</td>
                                <td className="p-1 border border-black uppercase">{o.patente || o.vehiculo?.patente || 'S/P'}</td>
                                <td className="p-1 border border-black text-right">{formatMoney(o.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {gastos.length > 0 && (
                    <>
                        <h3 className="font-bold text-[10px] uppercase border-b border-black mb-2">Detalle de Gastos</h3>
                        <table className="w-full text-[9px] border-collapse">
                            <thead>
                                <tr className="bg-gray-100 border border-black text-left">
                                    <th className="p-1 border border-black">DESCRIPCIÓN</th>
                                    <th className="p-1 border border-black text-right">MONTO</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gastos.map(g => (
                                    <tr key={g.id}>
                                        <td className="p-1 border border-black uppercase">{g.descripcion || g.nombre || g.categoria || 'Gasto'}</td>
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