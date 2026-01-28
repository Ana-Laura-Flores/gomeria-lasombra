import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
    getDashboardOrdenes,
    getGastosPorMes,
    getPagosPorMes,
} from "../services/api";
import Card from "../components/Card";

const formatMoney = (v) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
    }).format(Number(v) || 0);

export default function Dashboard() {
    const [data, setData] = useState({ ordenes: [], gastos: [], pagos: [] });
    const [loading, setLoading] = useState(true);
    const [mes, setMes] = useState("2026-01");
    const [soloTotales, setSoloTotales] = useState(false); // Estado para controlar el tipo de impresión

    useEffect(() => {
        const cargar = async () => {
            setLoading(true);
            try {
                const y = mes.split("-")[0];
                const m = mes.split("-")[1];
                const desde = `${y}-${m}-01`;
                const hasta = `${y}-${m}-31`;

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
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [mes]);

    // Cálculos
    const activas = data.ordenes.filter(o => o.estado !== "anulado");
    const totalFacturado = activas.reduce((a, o) => a + Number(o.total || 0), 0);
    const totalGastos = data.gastos.reduce((a, g) => a + Number(g.monto || 0), 0);
    const totalCobrado = data.pagos.reduce((a, p) => a + Number(p.monto || 0), 0);

    const handlePrint = (soloNumeros) => {
        setSoloTotales(soloNumeros);
        setTimeout(() => {
            window.print();
        }, 100);
    };

    return (
        <MainLayout>
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    nav, aside, .no-print { display: none !important; }
                    body { background: white !important; color: black !important; padding: 20px; }
                    .print-section { display: block !important; }
                    .ordenes-list { display: ${soloTotales ? 'none' : 'block'} !important; }
                }
                .print-section { display: none; }
            `}} />

            <div className="no-print">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-white uppercase">Cierre de Caja</h1>
                    <div className="flex gap-2">
                        <input 
                            type="month" 
                            value={mes} 
                            onChange={(e) => setMes(e.target.value)}
                            className="bg-gray-800 text-white p-2 rounded border border-gray-700 text-sm"
                        />
                        <button 
                            onClick={() => handlePrint(true)}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded text-xs font-bold uppercase"
                        >
                            Imprimir Solo Totales
                        </button>
                        <button 
                            onClick={() => handlePrint(false)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-xs font-bold uppercase"
                        >
                            Reporte Detallado
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card title="Cobrado (Caja)" value={formatMoney(totalCobrado)} color="text-green-400" />
                    <Card title="Gastos" value={formatMoney(totalGastos)} color="text-red-400" />
                    <Card title="Neto" value={formatMoney(totalCobrado - totalGastos)} color="text-blue-400" />
                    <Card title="Pendiente" value={formatMoney(totalFacturado - totalCobrado)} color="text-yellow-500" />
                </div>
            </div>

            {/* SECCIÓN DE IMPRESIÓN */}
            <div className="print-section text-black">
                <div className="text-center border-b-2 border-black pb-4 mb-6">
                    <h1 className="text-2xl font-bold uppercase">Gomería La Sombra</h1>
                    <p className="font-bold">RESUMEN DE CAJA - {mes}</p>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8 border border-black p-4">
                    <div>
                        <p className="text-sm border-b border-black mb-2 font-bold uppercase">Movimientos de Fondos</p>
                        <div className="flex justify-between"><span>(+) Total Cobrado:</span> <b>{formatMoney(totalCobrado)}</b></div>
                        <div className="flex justify-between"><span>(-) Total Gastos:</span> <b>{formatMoney(totalGastos)}</b></div>
                        <div className="flex justify-between border-t border-black mt-2 pt-2 text-lg font-bold">
                            <span>SALDO FINAL:</span> <span>{formatMoney(totalCobrado - totalGastos)}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm border-b border-black mb-2 font-bold uppercase">Estado de Ventas</p>
                        <div className="flex justify-between"><span>Total Facturado:</span> <b>{formatMoney(totalFacturado)}</b></div>
                        <div className="flex justify-between"><span>En Cta Cte:</span> <b>{formatMoney(totalFacturado - totalCobrado)}</b></div>
                        <div className="flex justify-between"><span>Cant. Órdenes:</span> <b>{activas.length}</b></div>
                    </div>
                </div>

                {!soloTotales && (
                    <div className="ordenes-list">
                        <p className="font-bold text-xs uppercase mb-2 border-b border-black">Detalle de Órdenes del Período</p>
                        <table className="w-full text-[10px] border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-black p-1 text-left">FECHA</th>
                                    <th className="border border-black p-1 text-left">CLIENTE</th>
                                    <th className="border border-black p-1 text-left">PATENTE</th>
                                    <th className="border border-black p-1 text-right">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activas.map(o => (
                                    <tr key={o.id}>
                                        <td className="border border-black p-1">{o.fecha?.split("T")[0]}</td>
                                        <td className="border border-black p-1 uppercase">{o.cliente?.nombre || 'Mostrador'}</td>
                                        <td className="border border-black p-1 uppercase">{o.patente}</td>
                                        <td className="border border-black p-1 text-right">{formatMoney(o.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-10 text-center text-[10px] italic">
                    <p>Documento de control interno - Gomería La Sombra</p>
                </div>
            </div>
        </MainLayout>
    );
}