import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
    getDashboardOrdenes,
    getGastosPorMes,
    getPagosPorMes,
    getStockDashboard,
} from "../services/api";
import Card from "../components/Card";

/* HELPERS (Se mantienen iguales) */
const formatMoney = (v) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
    }).format(Number(v) || 0);

const getRangoMes = (mes) => {
    const [y, m] = mes.split("-");
    const desde = `${y}-${m}-01`;
    const ultimoDia = new Date(y, Number(m), 0).getDate();
    const hasta = `${y}-${m}-${String(ultimoDia).padStart(2, "0")}`;
    return { desde, hasta };
};

const normalizarMetodo = (m) => {
    if (Array.isArray(m))
        return m[0]?.toLowerCase().replace(/\s+/g, "_") || "sin_metodo";
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
    const [productosBajoStock, setProductosBajoStock] = useState([]); // Nuevo estado
    const [loading, setLoading] = useState(true);

    const [modoFiltro, setModoFiltro] = useState("mes");
    const [fechaDia, setFechaDia] = useState("");
    const [mes, setMes] = useState("2026-01");
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");

    const getRango = () => {
        if (modoFiltro === "dia" && fechaDia)
            return { desde: fechaDia, hasta: fechaDia };
        if (modoFiltro === "mes" && mes) return getRangoMes(mes);
        if (modoFiltro === "rango" && fechaDesde && fechaHasta)
            return { desde: fechaDesde, hasta: fechaHasta };
        return getRangoMes(mes);
    };

   useEffect(() => {
    const cargar = async () => {
        setLoading(true);
        const { desde, hasta } = getRango();

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

            // --- DEBUREO: Mira la consola del navegador (F12) ---
            console.log("Lista de productos recibida:", prodRes.data);

            // Filtrar asegurando que comparamos Números
            const bajoStock = (prodRes.data || []).filter(p => {
                const s = Number(p.stock); // Convertimos a número por las dudas
                return s <= 5 && s >= 0; // Filtramos entre 0 y 5
            });

            console.log("Productos filtrados (Bajo Stock):", bajoStock);
            setProductosBajoStock(bajoStock);

        } catch (e) {
            console.error("Error cargando dashboard:", e);
        } finally {
            setLoading(false);
        }
    };

    cargar();
}, [modoFiltro, fechaDia, mes, fechaDesde, fechaHasta]);

    if (loading)
        return (
            <MainLayout>
                <div className="p-10 text-white">Cargando métricas...</div>
            </MainLayout>
        );

    /* CÁLCULOS */
    const totalOrdenes = ordenes.length;
    const totalFacturado = ordenes.reduce(
        (a, o) => a + Number(o.total || 0),
        0
    );
    const pagosValidos = pagos.filter(
        (p) => (p.tipo === "pago" && !p.anulado) || p.tipo === "anulacion"
    );
    const totalCobrado = pagosValidos.reduce(
        (a, p) => a + Number(p.monto || 0),
        0
    );
    const totalGastos = gastos.reduce((a, g) => a + Number(g.monto || 0), 0);
    const saldoPendiente = totalFacturado - totalCobrado;
    const resultadoReal = totalCobrado - totalGastos; // Dinero real en mano

    const pagosPorMetodo = pagosValidos.reduce((acc, p) => {
        const metodo = normalizarMetodo(p.metodo_pago);
        acc[metodo] = (acc[metodo] || 0) + Number(p.monto);
        return acc;
    }, {});

    return (
        <MainLayout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">
                    Resumen de Negocio
                </h1>

                {/* 🔎 Filtros con mejor estilo */}
                <div className="flex gap-2 bg-gray-800 p-2 rounded-lg border border-gray-700">
                    <select
                        value={modoFiltro}
                        onChange={(e) => setModoFiltro(e.target.value)}
                        className="bg-gray-900 text-white border-none rounded px-2 py-1 text-sm outline-none"
                    >
                        <option value="dia">Hoy</option>
                        <option value="mes">Mes</option>
                        <option value="rango">Rango</option>
                    </select>
                    {/* Inputs de fecha simplificados... */}
                    {modoFiltro === "mes" && (
                        <input
                            type="month"
                            value={mes}
                            onChange={(e) => setMes(e.target.value)}
                            className="bg-gray-900 text-white text-sm border-none rounded outline-none px-2"
                        />
                    )}
                </div>
            </div>

       {/* ⚠️ SECCIÓN DE ALERTAS DE STOCK */}
{productosBajoStock.length > 0 && (
    <div className="mb-6 w-full animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="bg-gradient-to-r from-red-900/40 to-orange-900/20 border-l-4 border-red-500 p-5 rounded-r-xl shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl animate-bounce">⚠️</span>
                <h2 className="text-red-400 font-black text-lg tracking-tight">
                    ATENCIÓN: REPOSICIÓN NECESARIA
                </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {productosBajoStock.map(p => (
                    <div key={p.id} className="bg-gray-900/80 border border-red-500/30 p-3 rounded-lg flex justify-between items-center shadow-inner">
                        <span className="text-gray-200 font-medium text-sm truncate pr-2">{p.nombre}</span>
                        <span className="bg-red-600 text-white text-xs font-black px-2 py-1 rounded-md min-w-[40px] text-center">
                            {p.stock} UN
                        </span>
                    </div>
                ))}
            </div>
        </div>
    </div>
)}

            {/* 📊 MÉTRICAS DE DINERO (LO MÁS IMPORTANTE) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
                <Card
                    title="Ingresos Reales (Caja)"
                    value={formatMoney(totalCobrado)}
                    color="text-green-400"
                />
                <Card
                    title="Gastos Totales"
                    value={formatMoney(totalGastos)}
                    color="text-red-400"
                />
                <Card
                    title="Resultado (Caja - Gastos)"
                    value={formatMoney(resultadoReal)}
                    color={
                        resultadoReal >= 0 ? "text-blue-400" : "text-orange-500"
                    }
                />
                <Card
                    title="Pendiente de Cobro"
                    value={formatMoney(saldoPendiente)}
                    color="text-yellow-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* DETALLE INGRESOS */}
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                    <h2 className="text-lg font-bold text-white mb-4 border-l-4 border-green-500 pl-3">
                        Ingresos por Método
                    </h2>
                    <div className="space-y-3">
                        {Object.entries(pagosPorMetodo).map(
                            ([metodo, total]) => (
                                <div
                                    key={metodo}
                                    className="flex justify-between items-center bg-gray-800 p-3 rounded-lg"
                                >
                                    <span className="text-gray-300">
                                        {formatMetodoPago(metodo)}
                                    </span>
                                    <span className="text-white font-mono font-bold">
                                        {formatMoney(total)}
                                    </span>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* RESUMEN OPERATIVO */}
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                    <h2 className="text-lg font-bold text-white mb-4 border-l-4 border-blue-500 pl-3">
                        Resumen Operativo
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-800 rounded-lg text-center">
                            <p className="text-gray-400 text-xs">
                                Órdenes Totales
                            </p>
                            <p className="text-2xl font-bold text-white">
                                {totalOrdenes}
                            </p>
                        </div>
                        <div className="p-4 bg-gray-800 rounded-lg text-center">
                            <p className="text-gray-400 text-xs">
                                Total Facturado
                            </p>
                            <p className="text-xl font-bold text-white">
                                {formatMoney(totalFacturado)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
