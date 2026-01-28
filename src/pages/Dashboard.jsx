import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
    getDashboardOrdenes,
    getGastosPorMes,
    getPagosPorMes,
    getStockDashboard,
    getClientes, 
} from "../services/api";
import Card from "../components/Card";

/* --- HELPERS --- */
const formatMoney = (v) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
    }).format(Number(v) || 0);

const formatSoloFecha = (str) => {
    if (!str) return "---";
    return str.split(/T| /)[0];
};

const getRangoMes = (mes) => {
    if (!mes) return { desde: "", hasta: "" };
    const [y, m] = mes.split("-");
    const desde = `${y}-${m}-01`;
    const ultimoDia = new Date(y, Number(m), 0).getDate();
    const hasta = `${y}-${m}-${String(ultimoDia).padStart(2, "0")}`;
    return { desde, hasta };
};

export default function Dashboard() {
    const [ordenes, setOrdenes] = useState([]);
    const [gastos, setGastos] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [clientes, setClientes] = useState([]);
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
                // Primero cargamos lo vital
                const [oRes, gRes, pRes, prodRes] = await Promise.all([
                    getDashboardOrdenes(desde, hasta),
                    getGastosPorMes(desde, hasta),
                    getPagosPorMes(desde, hasta),
                    getStockDashboard(),
                ]);

                setOrdenes(oRes.data || []);
                setGastos(gRes.data || []);
                setPagos(pRes.data || []);
                
                // Cargamos clientes por separado. Si falla, no bloquea el dashboard.
                try {
                    const cRes = await getClientes();
                    const listaClientes = cRes.data?.data || cRes.data || [];
                    setClientes(listaClientes);
                } catch (err) {
                    console.error("Error al traer clientes (posible config API):", err);
                }

                const listaProd = prodRes.data?.data || prodRes.data || [];
                setProductosBajoStock(listaProd.filter(p => Number(p.stock) <= 5));
            } catch (e) {
                console.error("Error crítico:", e);
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, [modoFiltro, fechaDia, mes, fechaDesde, fechaHasta]);

    const obtenerNombreCliente = (id) => {
        if (!id) return "CONSUMIDOR FINAL";
        // Si el id ya es un objeto (porque la API lo expandió), devolvemos el nombre
        if (typeof id === 'object') return id.nombre || "S/N";
        // Si es un string (ID), buscamos en nuestra lista de clientes
        const encontrado = clientes.find(c => c.id === id);
        return encontrado ? encontrado.nombre : `ID: ${id.substring(0,5)}...`;
    };

    const ordenesActivas = ordenes.filter(o => {
        const s = String(o.estado || "").toLowerCase().trim();
        return s !== 'anulado' && s !== 'anulada' && s !== 'archived';
    });

    const totalFacturado = ordenesActivas.reduce((a, o) => a + Number(o.total || 0), 0);
    const totalCobrado = pagos.reduce((a, p) => (p.anulado ? a : a + Number(p.monto || 0)), 0);
    const totalGastos = gastos.reduce((a, g) => a + Number(g.monto || 0), 0);

    return (
        <MainLayout>
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    nav, aside, button, select, input, .no-print { display: none !important; }
                    body { background: white !important; color: black !important; margin: 0; padding: 0; }
                    .print-only { display: block !important; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid black !important; padding: 5px; text-align: left; font-size: 9px; }
                    th { background-color: #eee !important; }
                }
                .print-only { display: none; }
            `}} />

            {/* PANTALLA */}
            <div className="no-print">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white uppercase">Dashboard de Gestión</h1>
                    <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-black text-xs uppercase">
                        Imprimir Reporte
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card title="Ingresos (Caja)" value={formatMoney(totalCobrado)} color="text-green-400" />
                    <Card title="Gastos Totales" value={formatMoney(totalGastos)} color="text-red-400" />
                    <Card title="Resultado Neto" value={formatMoney(totalCobrado - totalGastos)} color="text-blue-400" />
                    <Card title="Pendiente Cobro" value={formatMoney(totalFacturado - totalCobrado)} color="text-yellow-500" />
                </div>
            </div>

            {/* IMPRESIÓN */}
            <div className="print-only">
                <div style={{ textAlign: 'center', borderBottom: '2px solid black', marginBottom: '20px', paddingBottom: '10px' }}>
                    <h1 style={{ fontSize: '24px', margin: 0 }}>GOMERÍA LA SOMBRA</h1>
                    <p style={{ fontWeight: 'bold' }}>CIERRE DE CAJA: {formatSoloFecha(getRango().desde)} al {formatSoloFecha(getRango().hasta)}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div style={{ border: '1px solid black', padding: '10px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 'bold', borderBottom: '1px solid black' }}>RESUMEN DE FONDOS</p>
                        <p>Total Cobrado: <b>{formatMoney(totalCobrado)}</b></p>
                        <p>Total Gastos: <b>{formatMoney(totalGastos)}</b></p>
                        <p style={{ fontSize: '14px', borderTop: '1px solid black', marginTop: '5px' }}>SALDO: <b>{formatMoney(totalCobrado - totalGastos)}</b></p>
                    </div>
                    <div style={{ border: '1px solid black', padding: '10px' }}>
                        <p style={{ fontSize: '10px', fontWeight: 'bold', borderBottom: '1px solid black' }}>OPERATIVO</p>
                        <p>Órdenes: <b>{ordenesActivas.length}</b></p>
                        <p>Total Facturado: <b>{formatMoney(totalFacturado)}</b></p>
                        <p>A Cobrar: <b>{formatMoney(totalFacturado - totalCobrado)}</b></p>
                    </div>
                </div>

                <p style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '5px' }}>DETALLE DE ÓRDENES</p>
                <table>
                    <thead>
                        <tr>
                            <th>COMP.</th>
                            <th>FECHA</th>
                            <th>CLIENTE</th>
                            <th>PATENTE</th>
                            <th>PAGO</th>
                            <th style={{ textAlign: 'right' }}>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ordenesActivas.map(o => (
                            <tr key={o.id}>
                                <td>{o.comprobante || o.id}</td>
                                <td>{formatSoloFecha(o.fecha)}</td>
                                <td style={{ fontWeight: 'bold' }}>{obtenerNombreCliente(o.cliente)}</td>
                                <td>{(o.patente || "S/P").toUpperCase()}</td>
                                <td style={{ fontSize: '8px' }}>{(o.condicion_cobro || "CONTADO").replace('_', ' ').toUpperCase()}</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatMoney(o.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </MainLayout>
    );
}