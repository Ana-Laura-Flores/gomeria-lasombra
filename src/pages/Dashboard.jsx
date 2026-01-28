import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
    getDashboardOrdenes,
    getGastosPorMes,
    getPagosPorMes,
} from "../services/api";
import Card from "../components/Card";

/* --- HELPERS --- */
const formatMoney = (v) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
    }).format(Number(v) || 0);

const formatMetodo = (m) => {
    if (!m) return "Otros/Varios";
    return m.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

export default function Dashboard() {
    const [data, setData] = useState({ ordenes: [], gastos: [], pagos: [] });
    const [loading, setLoading] = useState(true);
    const [modoFiltro, setModoFiltro] = useState("mes");
    const [fechaDia, setFechaDia] = useState(new Date().toISOString().split('T')[0]);
    const [mes, setMes] = useState("2026-01"); 

    const getRango = () => {
        if (modoFiltro === "dia") return { desde: fechaDia, hasta: fechaDia };
        const [y, m] = mes.split("-");
        const ultimoDia = new Date(y, Number(m), 0).getDate();
        return { desde: `${y}-${m}-01`, hasta: `${y}-${m}-${String(ultimoDia).padStart(2, "0")}` };
    };

    useEffect(() => {
        const cargar = async () => {
            const { desde, hasta } = getRango();
            setLoading(true);
            try {
                const [oRes, gRes, pRes] = await Promise.all([
                    getDashboardOrdenes(desde, hasta),
                    getGastosPorMes(desde, hasta),
                    getPagosPorMes(desde, hasta),
                ]);
                setData({
                    ordenes: oRes.data || [],
                    gastos: gRes.data || [],
                    pagos: pRes.data || []
                });
            } catch (e) {
                console.error("Error Dashboard:", e);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [modoFiltro, fechaDia, mes]);

    // --- LÓGICA DE CAJA POR MODALIDAD ---
    const activas = data.ordenes.filter(o => o.estado !== 'anulado' && o.estado !== 'anulada');
    const totalFacturado = activas.reduce((a, o) => a + Number(o.total || 0), 0);
    
    // Obtenemos todos los métodos de pago únicos usados tanto en pagos como en gastos
    const metodosUnicos = Array.from(new Set([
        ...data.pagos.map(p => p.metodo_pago),
        ...data.gastos.map(g => g.metodo_pago)
    ])).filter(m => m); // Sacamos nulos

    const desgloseCaja = metodosUnicos.map(metodo => {
        const ingresos = data.pagos
            .filter(p => p.metodo_pago === metodo && !p.anulado)
            .reduce((a, p) => a + Number(p.monto), 0);
        
        const egresos = data.gastos
            .filter(g => g.metodo_pago === metodo)
            .reduce((a, g) => a + Number(g.monto), 0);

        return {
            metodo,
            ingresos,
            egresos,
            neto: ingresos - egresos
        };
    });

    const totalIngresos = desgloseCaja.reduce((a, c) => a + c.ingresos, 0);
    const totalEgresos = desgloseCaja.reduce((a, c) => a + c.egresos, 0);

    return (
        <MainLayout>
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    nav, aside, button, select, input, .no-print { display: none !important; }
                    body { background: white !important; color: black !important; padding: 0; }
                    .print-report { display: block !important; padding: 20px; font-size: 12px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid black !important; padding: 6px; text-align: left; }
                    .text-right { text-align: right; }
                }
                .print-report { display: none; }
            `}} />

            {/* --- DASHBOARD PANTALLA --- */}
            <div className="no-print">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Caja Real por Modalidad</h1>
                    <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg border border-gray-700">
                        <select value={modoFiltro} onChange={(e) => setModoFiltro(e.target.value)} className="bg-gray-900 text-white rounded px-3 py-1 text-sm outline-none">
                            <option value="dia">Día</option>
                            <option value="mes">Mes</option>
                        </select>
                        <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded font-black uppercase text-xs">
                            Imprimir Reporte
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card title="Ingresos Totales" value={formatMoney(totalIngresos)} color="text-green-400" />
                    <Card title="Egresos Totales" value={formatMoney(totalEgresos)} color="text-red-400" />
                    <Card title="Neto en Mano" value={formatMoney(totalIngresos - totalEgresos)} color="text-blue-400" />
                    <Card title="Pendiente (Cta Cte)" value={formatMoney(totalFacturado - totalIngresos)} color="text-yellow-500" />
                </div>

                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                    <h2 className="text-white font-bold mb-4 uppercase text-sm">Resumen Detallado por Medio</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-300">
                            <thead>
                                <tr className="border-b border-gray-700 text-xs uppercase text-gray-500">
                                    <th className="py-2">Medio</th>
                                    <th className="py-2 text-right">Ingresos</th>
                                    <th className="py-2 text-right">Gastos</th>
                                    <th className="py-2 text-right">Saldo Neto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {desgloseCaja.map(item => (
                                    <tr key={item.metodo} className="border-b border-gray-800/50">
                                        <td className="py-3 font-bold text-white">{formatMetodo(item.metodo)}</td>
                                        <td className="py-3 text-right text-green-400">{formatMoney(item.ingresos)}</td>
                                        <td className="py-3 text-right text-red-400">{formatMoney(item.egresos)}</td>
                                        <td className="py-3 text-right font-mono text-blue-300">{formatMoney(item.neto)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* --- REPORTE IMPRESIÓN --- */}
            <div className="print-report">
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h1 style={{ margin: 0 }}>GOMERÍA LA SOMBRA</h1>
                    <p><b>REPORTE DE CAJA POR MODALIDAD</b></p>
                    <p>Período: {getRango().desde} al {getRango().hasta}</p>
                </div>

                <table>
                    <thead>
                        <tr style={{ background: '#eee' }}>
                            <th>MEDIO DE PAGO</th>
                            <th className="text-right">INGRESOS</th>
                            <th className="text-right">EGRESOS</th>
                            <th className="text-right">SALDO REAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {desgloseCaja.map(item => (
                            <tr key={item.metodo}>
                                <td>{formatMetodo(item.metodo)}</td>
                                <td className="text-right">{formatMoney(item.ingresos)}</td>
                                <td className="text-right">{formatMoney(item.egresos)}</td>
                                <td className="text-right"><b>{formatMoney(item.neto)}</b></td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ fontWeight: 'bold', background: '#f9f9f9' }}>
                            <td>TOTALES GENERALES</td>
                            <td className="text-right">{formatMoney(totalIngresos)}</td>
                            <td className="text-right">{formatMoney(totalEgresos)}</td>
                            <td className="text-right" style={{ fontSize: '14px' }}>{formatMoney(totalIngresos - totalEgresos)}</td>
                        </tr>
                    </tfoot>
                </table>

                <div style={{ marginTop: '20px', padding: '10px', border: '1px solid black' }}>
                    <p style={{ margin: 0 }}><b>FACTURACIÓN TOTAL (Órdenes):</b> {formatMoney(totalFacturado)}</p>
                    <p style={{ margin: '5px 0 0 0' }}><b>PENDIENTE DE COBRO (Cta Cte):</b> {formatMoney(totalFacturado - totalIngresos)}</p>
                </div>

                <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ borderTop: '1px solid black', width: '150px', textAlign: 'center' }}>Firma Caja</div>
                    <div style={{ borderTop: '1px solid black', width: '150px', textAlign: 'center' }}>Firma Control</div>
                </div>
            </div>
        </MainLayout>
    );
}