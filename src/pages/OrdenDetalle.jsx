import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";

import { 
    getOrdenTrabajoById, 
    anularOrdenCompleta 
} from "../services/api";

import logo from "../assets/logo.jpg";
import OrdenPrint from "../components/OrdenPrint";
import { exportarPDFOrden } from "../utils/exportarPDFOrden";

const formatMoney = (value) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
    }).format(Number(value) || 0);

export default function OrdenDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [orden, setOrden] = useState(null);
    const [loading, setLoading] = useState(true);
    const [anulando, setAnulando] = useState(false);
    
    // Estados para los Modales
    const [mostrarModalPregunta, setMostrarModalPregunta] = useState(false);
    const [mostrarModalExito, setMostrarModalExito] = useState(false);

    const fetchOrden = async () => {
        try {
            setLoading(true);
            const res = await getOrdenTrabajoById(id);
            setOrden(res.data || null);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrden(); }, [id]);

    const confirmarAnulacion = async () => {
        try {
            setAnulando(true);
            await anularOrdenCompleta(orden);
            
            // 1. Update Optimista
            setOrden(prev => ({ ...prev, estado: 'anulado' }));
            
            // 2. Swapear modales
            setMostrarModalPregunta(false);
            setMostrarModalExito(true);
            
            await fetchOrden(); 
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            setAnulando(false);
        }
    };

    if (loading && !orden) return <MainLayout><div className="p-10 text-center text-white animate-pulse">Cargando orden...</div></MainLayout>;
    if (!orden) return <MainLayout><div className="p-10 text-center text-red-400">Orden no encontrada</div></MainLayout>;
return (
        <MainLayout>
            <div className={`max-w-4xl mx-auto bg-gray-900 p-6 rounded-lg relative shadow-xl transition-all ${orden.estado === 'anulado' ? 'border border-red-900/50 opacity-90' : ''}`}>
                
                {/* Sello visual de Anulada */}
                {orden.estado === "anulado" && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-[12px] border-red-600/20 text-red-600/20 px-12 py-6 text-7xl font-black uppercase -rotate-12 pointer-events-none z-50 select-none">
                        Anulada
                    </div>
                )}

                {/* ===== HEADER ===== */}
                <div className="flex justify-between items-start mb-8 border-b border-gray-800 pb-6">
                    <div className="flex items-center gap-4">
                        <img src={logo} alt="Logo" className="h-16 w-16 rounded shadow-lg object-cover" />
                        <div>
                            <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Gomería La Sombra</h1>
                            {/* Mostramos el Comprobante como título principal */}
                            <p className="text-xl font-black text-green-500 font-mono">
                                COMPROBANTE: {orden.comprobante || <span className="text-yellow-500 animate-pulse underline">SIN NÚMERO</span>}
                            </p>
                        </div>
                    </div>
                    <div className="text-right text-gray-300">
                        <p className="text-lg font-semibold">{new Date(orden.fecha).toLocaleDateString()}</p>
                        {/* El ID queda como una referencia técnica pequeña debajo */}
                        <p className="text-xs text-gray-500 font-mono uppercase tracking-tighter">Ref. Interna: ID-{orden.id}</p>
                    </div>
                </div>

                {/* ===== DATOS DEL CLIENTE (Igual pero con bordes más suaves) ===== */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-gray-800/40 p-5 rounded-xl border border-gray-700/50">
                    <div>
                        <p className="text-gray-500 text-[10px] uppercase font-black mb-1 tracking-widest">Cliente / Titular</p>
                        <p className="text-white text-lg font-medium">{orden.cliente?.nombre || "Consumidor Final"}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-[10px] uppercase font-black mb-1 tracking-widest">Vehículo (Patente)</p>
                        <p className="text-white text-lg font-medium uppercase tracking-[0.2em]">{orden.patente || "No registra"}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-[10px] uppercase font-black mb-1 tracking-widest">Condición</p>
                        <span className={`inline-block px-3 py-1 rounded-md text-[10px] font-black uppercase ${orden.condicion_cobro === 'contado' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                            {orden.condicion_cobro === 'contado' ? 'Efectivo / Contado' : 'Cuenta Corriente'}
                        </span>
                    </div>
                </div>

                {/* ===== TABLA DE ITEMS (Sin cambios significativos, funciona perfecto) ===== */}
                {/* ... tu tabla de items ... */}

                {/* ===== TOTALES ===== */}
                <div className="flex flex-col items-end gap-1 border-t border-gray-800 pt-6">
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Monto Total Liquidado</p>
                    <div className={`text-5xl font-black ${orden.estado === 'anulado' ? 'text-gray-700 line-through' : 'text-white'}`}>
                        {formatMoney(orden.total)}
                    </div>
                </div>

                {/* ===== ACCIONES ===== */}
                <div className="mt-10 flex flex-wrap justify-between items-center gap-4 bg-gray-800/20 p-4 rounded-xl print:hidden">
                    <button 
                        onClick={() => navigate("/ordenes")} 
                        className="px-6 py-2.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition font-bold text-sm"
                    >
                        ← Volver
                    </button>
                    
                    <div className="flex gap-3">
                        {orden.estado !== "anulado" ? (
                            <button 
                                onClick={() => setMostrarModalPregunta(true)} 
                                className="px-6 py-2.5 bg-red-600/10 text-red-500 border border-red-500/50 rounded-lg font-black hover:bg-red-600 hover:text-white transition-all active:scale-95 text-sm"
                            >
                                ANULAR ORDEN
                            </button>
                        ) : (
                            <div className="px-6 py-2.5 text-red-500 font-black border border-red-900/50 rounded-lg bg-red-900/10 flex items-center gap-2 text-sm">
                                ORDEN ANULADA
                            </div>
                        )}
                        
                        <button 
                            onClick={() => exportarPDFOrden({ elementId: "orden-print", filename: `comprobante-${orden.comprobante || orden.id}.pdf` })} 
                            disabled={orden.estado === 'anulado'}
                            className={`px-6 py-2.5 bg-green-600 text-white rounded-lg font-black shadow-lg shadow-green-900/20 transition-all flex items-center gap-2 text-sm ${orden.estado === 'anulado' ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:bg-green-700'}`}
                        >
                            <span>⎙</span> GENERAR PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL 1: PREGUNTA */}
            <ModalBase 
                abierto={mostrarModalPregunta} 
                titulo="¿Anular esta orden?" 
                mensaje="Esta acción devolverá los productos al stock y anulará el movimiento en la cuenta corriente del cliente. ¿Desea continuar?"
                colorBoton="bg-red-600"
                textoBoton={anulando ? "Procesando..." : "Sí, Anular Orden"}
                alConfirmar={confirmarAnulacion}
                alCerrar={() => setMostrarModalPregunta(false)}
                cargando={anulando}
            />

            {/* MODAL 2: ÉXITO */}
            <ModalBase 
                abierto={mostrarModalExito} 
                titulo="¡Operación Exitosa!" 
                mensaje="La orden ha sido anulada correctamente. El inventario ha sido actualizado de forma automática."
                colorBoton="bg-green-600"
                textoBoton="Entendido"
                soloOk={true}
                alConfirmar={() => setMostrarModalExito(false)}
                alCerrar={() => setMostrarModalExito(false)}
            />

            {/* Impresión oculta */}
            <div className="hidden"><OrdenPrint orden={orden} /></div>
        </MainLayout>
    );
}

// Componente de Modal Reutilizable
const ModalBase = ({ abierto, alConfirmar, alCerrar, titulo, mensaje, colorBoton, textoBoton, cargando, soloOk }) => {
    if (!abierto) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 text-center">
                    <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${colorBoton} bg-opacity-20`}>
                       <span className={`text-2xl ${colorBoton.replace('bg-', 'text-')}`}>{soloOk ? '✓' : '!'}</span>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">{titulo}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{mensaje}</p>
                </div>
                <div className="bg-gray-800/50 p-4 flex gap-3">
                    {!soloOk && (
                        <button onClick={alCerrar} disabled={cargando} className="flex-1 px-4 py-3 text-gray-400 hover:text-white font-bold transition">
                            Cancelar
                        </button>
                    )}
                    <button 
                        onClick={alConfirmar} 
                        disabled={cargando}
                        className={`flex-1 px-4 py-3 ${colorBoton} text-white rounded-xl font-black hover:brightness-110 transition shadow-lg disabled:opacity-50`}
                    >
                        {textoBoton}
                    </button>
                </div>
            </div>
        </div>
    );
};