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
        <p className="text-sm font-bold uppercase">Reporte Detallado de Caja</p>
        <p className="text-xs italic">Periodo: {getRango().desde} al {getRango().hasta}</p>
    </div>

    {/* Resumen de Valores */}
    <div className="grid grid-cols-3 gap-2 mb-8">
        <div className="border border-black p-2 text-center">
            <p className="text-[10px] font-bold uppercase">Total Facturado</p>
            <p className="text-lg font-black">{formatMoney(totalFacturado)}</p>
        </div>
        <div className="border border-black p-2 text-center bg-gray-100">
            <p className="text-[10px] font-bold uppercase">Caja Real (Cobrado)</p>
            <p className="text-lg font-black">{formatMoney(totalCobrado)}</p>
        </div>
        <div className="border border-black p-2 text-center">
            <p className="text-[10px] font-bold uppercase">Pendiente (Cta. Cte.)</p>
            <p className="text-lg font-black">{formatMoney(totalFacturado - totalCobrado)}</p>
        </div>
    </div>

    {/* TABLA 1: DETALLE DE ÓRDENES REALIZADAS */}
    <div className="mb-8">
        <h3 className="font-bold border-b border-black text-xs uppercase mb-2">📋 Detalle de Trabajo (Órdenes)</h3>
        <table className="w-full text-[10px] border-collapse">
            <thead>
                <tr className="bg-gray-100">
                    <th className="border border-black p-1 text-left">Fecha</th>
                    <th className="border border-black p-1 text-left">Cliente / Vehículo</th>
                    <th className="border border-black p-1 text-left">Condición</th>
                    <th className="border border-black p-1 text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                {ordenesActivas.map(o => (
                    <tr key={o.id}>
                        <td className="border border-black p-1">{o.fecha}</td>
                        <td className="border border-black p-1 uppercase">{o.cliente?.nombre || 'Mostrador'} - {o.patente || 'S/P'}</td>
                        <td className="border border-black p-1">{o.condicion_cobro === 'cuenta_corriente' ? 'Cta. Corriente' : 'Contado'}</td>
                        <td className="border border-black p-1 text-right">{formatMoney(o.total)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>

    {/* TABLA 2: CUENTAS CORRIENTES GENERADAS (Quienes no pagaron hoy) */}
    {(totalFacturado - totalCobrado) > 0 && (
        <div className="mb-8">
            <h3 className="font-bold border-b border-black text-xs uppercase mb-2 text-red-700">⚠️ Deuda Generada en el Periodo</h3>
            <table className="w-full text-[10px] border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-black p-1 text-left">Cliente</th>
                        <th className="border border-black p-1 text-left">Concepto</th>
                        <th className="border border-black p-1 text-right">Monto a Cobrar</th>
                    </tr>
                </thead>
                <tbody>
                    {ordenesActivas.filter(o => o.condicion_cobro === 'cuenta_corriente').map(o => (
                        <tr key={o.id}>
                            <td className="border border-black p-1 font-bold uppercase">{o.cliente?.nombre}</td>
                            <td className="border border-black p-1">Orden #{o.id} - {o.patente}</td>
                            <td className="border border-black p-1 text-right font-bold">{formatMoney(o.total)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan="2" className="border border-black p-1 text-right font-bold uppercase">Total a Cobrar:</td>
                        <td className="border border-black p-1 text-right font-black bg-gray-50">{formatMoney(totalFacturado - totalCobrado)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    )}
{/* TABLA 3: DETALLE DE GASTOS (Lo que salió de la caja) */}
{gastos.length > 0 && (
    <div className="mb-8">
        <h3 className="font-bold border-b border-black text-xs uppercase mb-2 text-red-600">💸 Detalle de Gastos</h3>
        <table className="w-full text-[10px] border-collapse">
            <thead>
                <tr className="bg-gray-100">
                    <th className="border border-black p-1 text-left">Fecha</th>
                    <th className="border border-black p-1 text-left">Concepto / Descripción</th>
                    <th className="border border-black p-1 text-right">Monto</th>
                </tr>
            </thead>
            <tbody>
                {gastos.map(g => (
                    <tr key={g.id}>
                        <td className="border border-black p-1">{g.fecha || getRango().desde}</td>
                        <td className="border border-black p-1 uppercase">{g.descripcion || 'Gasto General'}</td>
                        <td className="border border-black p-1 text-right">{formatMoney(g.monto)}</td>
                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr>
                    <td colSpan="2" className="border border-black p-1 text-right font-bold uppercase">Total Gastos:</td>
                    <td className="border border-black p-1 text-right font-black">{formatMoney(totalGastos)}</td>
                </tr>
            </tfoot>
        </table>
    </div>
)}

{/* RESUMEN FINAL PARA EL CIERRE */}
<div className="mt-4 p-4 border-2 border-black bg-gray-50">
    <h3 className="text-center font-black uppercase text-sm mb-3">Balance Final de Caja</h3>
    <div className="space-y-2">
        <div className="flex justify-between text-xs">
            <span>(+) TOTAL COBRADO (Efectivo/Transferencias):</span>
            <span className="font-bold">{formatMoney(totalCobrado)}</span>
        </div>
        <div className="flex justify-between text-xs">
            <span>(-) TOTAL GASTOS PAGADOS:</span>
            <span className="font-bold text-red-600">{formatMoney(totalGastos)}</span>
        </div>
        <div className="flex justify-between border-t border-black pt-2 text-lg font-black">
            <span>SOBRANTE EN CAJA:</span>
            <span className="text-blue-700">{formatMoney(totalCobrado - totalGastos)}</span>
        </div>
    </div>
    <p className="text-[8px] mt-4 italic text-center text-gray-600">
        * Este reporte no incluye deudas pendientes de cobro en el saldo final de caja.
    </p>
</div>
    {/* Espacio para firmas al final del papel */}
    <div className="mt-10 flex justify-between px-10">
        <div className="text-center border-t border-black w-32 pt-1 text-[8px] uppercase">Firma Responsable</div>
        <div className="text-center border-t border-black w-32 pt-1 text-[8px] uppercase">Control General</div>
    </div>
</div>
        </MainLayout>
    );
}