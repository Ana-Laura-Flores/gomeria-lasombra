import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
    getDashboardOrdenes,
    getGastosPorMes,
    getPagosPorMes,
    getStockDashboard,
} from "../services/api";
import Card from "../components/Card";

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
                console.error("Error Dashboard:", e);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [modoFiltro, fechaDia, mes, fechaDesde, fechaHasta]);

    if (loading) return <MainLayout><div className="p-10 text-white font-black animate-pulse text-center uppercase">Cargando métricas...</div></MainLayout>;

    const ordenesActivas = ordenes.filter(o => {
        const est = String(o.estado || "").toLowerCase().trim();
        return est !== 'anulado' && est !== 'anulada' && est !== 'archived';
    });

    const totalFacturado = ordenesActivas.reduce((a, o) => a + Number(o.total || 0), 0);
    const pagosValidos = pagos.filter(p => !p.anulado);
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
                    nav, aside, button, select, input, .no-print, .stock-alert { display: none !important; }
                    body { background: white !important; color: black !important; padding: 0; margin: 0; }
                    .print-only { display: block !important; padding: 20px !important; }
                    h1, h2, h3 { color: black !important; text-transform: uppercase; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid black !important; }
                    th, td { border: 1px solid black !important; padding: 6px; text-align: left; font-size: 10px; color: black !important; }
                    th { background-color: #f0f0f0 !important; }
                    .text-right { text-align: right; }
                }
                .print-only { display: none; }
            `}} />

            {/* VISTA PANTALLA */}
            <div className="no-print">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-white uppercase">Dashboard</h1>
                    <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold text-sm">
                        IMPRIMIR REPORTE
                    </button>
                </div>

                {/* ALERTA STOCK */}
                {productosBajoStock.length > 0 && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/50 p-4 rounded-xl">
                        <h2 className="text-red-500 font-bold text-xs uppercase mb-2">⚠️ Stock Crítico</h2>
                        <div className="flex flex-wrap gap-2">
                            {productosBajoStock.map(p => (
                                <span key={p.id} className="bg-gray-900 text-[10px] px-2 py-1 rounded border border-red-900">
                                    {p.nombre}: <b className="text-red-500">{p.stock}</b>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card title="Cobrado (Ingreso)" value={formatMoney(totalCobrado)} color="text-green-400" />
                    <Card title="Gastos (Egreso)" value={formatMoney(totalGastos)} color="text-red-400" />
                    <Card title="Neto" value={formatMoney(totalCobrado - totalGastos)} color="text-blue-400" />
                    <Card title="Cta. Cte." value={formatMoney(totalFacturado - totalCobrado)} color="text-yellow-500" />
                </div>
            </div>

            {/* VISTA IMPRESIÓN REFORZADA */}
            <div className="print-only">
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ margin: 0 }}>Gomería La Sombra</h1>
                    <p style={{ fontSize: '12px' }}>Cierre de Caja: {getRango().desde} al {getRango().hasta}</p>
                </div>

                <h3 style={{ borderBottom: '2px solid black', marginTop: '20px' }}>Resumen de Fondos</h3>
                <table>
                    <thead>
                        <tr>
                            <th>CONCEPTO</th>
                            <th className="text-right">IMPORTE</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>TOTAL INGRESOS (Cobros registrados)</td><td className="text-right">{formatMoney(totalCobrado)}</td></tr>
                        <tr><td>TOTAL EGRESOS (Gastos registrados)</td><td className="text-right">{formatMoney(totalGastos)}</td></tr>
                        <tr style={{ fontSize: '12px', fontWeight: 'bold' }}>
                            <td>SALDO NETO</td>
                            <td className="text-right">{formatMoney(totalCobrado - totalGastos)}</td>
                        </tr>
                    </tbody>
                </table>

                {/* DETALLE DE GASTOS: Aquí usamos "concepto" */}
                <h3 style={{ borderBottom: '2px solid black', marginTop: '20px' }}>Detalle de Gastos (Egresos)</h3>
                {gastos.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>FECHA</th>
                                <th>CONCEPTO</th>
                                <th>MÉTODO</th>
                                <th className="text-right">MONTO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gastos.map((g) => (
                                <tr key={g.id}>
                                    <td>{g.fecha}</td>
                                    <td style={{ textTransform: 'uppercase' }}>{g.concepto || "Sin concepto"}</td>
                                    <td>{formatMetodoPago(g.metodo_pago)}</td>
                                    <td className="text-right">{formatMoney(g.monto)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p>No se registraron gastos en este período.</p>}

                <h3 style={{ borderBottom: '2px solid black', marginTop: '20px' }}>Ingresos por Medio de Pago</h3>
                <table>
                    <tbody>
                        {Object.entries(pagosPorMetodo).map(([met, mon]) => (
                            <tr key={met}>
                                <td>{formatMetodoPago(met)}</td>
                                <td className="text-right"><b>{formatMoney(mon)}</b></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </MainLayout>
    );
}