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
            
            // 2. Cerramos el de pregunta y abrimos el de éxito
            setMostrarModalPregunta(false);
            setMostrarModalExito(true);
            
            await fetchOrden(); 
        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            setAnulando(false);
        }
    };

    if (loading && !orden) return <MainLayout><p className="p-6 text-white">Cargando...</p></MainLayout>;
    if (!orden) return <MainLayout><p className="p-6 text-red-400">No encontrada</p></MainLayout>;

    return (
        <MainLayout>
            <div className={`max-w-4xl mx-auto bg-gray-900 p-6 rounded-lg relative shadow-xl ${orden.estado === 'anulado' ? 'border border-red-900/30' : ''}`}>
                
                {/* Sello visual */}
                {orden.estado === "anulado" && (
                    <div className="absolute top-40 left-1/2 -translate-x-1/2 -translate-y-1/2 border-8 border-red-600/30 text-red-600/30 px-10 py-4 text-6xl font-black uppercase -rotate-12 pointer-events-none z-50">
                        Anulada
                    </div>
                )}

                {/* Header y Datos (Igual que antes) */}
                <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                    <img src={logo} alt="Logo" className="h-12" />
                    <div className="text-right text-white text-sm">
                        <p className="font-bold">Orden #{orden.id}</p>
                        <p>{new Date(orden.fecha).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* ... (Contenido de la orden: Clientes, Tabla, Totales) ... */}

                {/* Acciones */}
                <div className="mt-8 flex justify-between gap-3 border-t border-gray-800 pt-6">
                    <button onClick={() => navigate("/ordenes")} className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600">
                        Volver
                    </button>
                    
                    <div className="flex gap-2">
                        {orden.estado !== "anulado" ? (
                            <button 
                                onClick={() => setMostrarModalPregunta(true)} 
                                className="px-4 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700"
                            >
                                Anular Orden
                            </button>
                        ) : (
                            <span className="px-4 py-2 text-red-500 font-bold border border-red-900/50 rounded bg-red-900/10">
                                ANULADA
                            </span>
                        )}
                        
                        <button onClick={() => exportarPDFOrden({ elementId: "orden-print", filename: `orden-${orden.id}.pdf` })} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                            Descargar PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL 1: PREGUNTA */}
            <ModalBase 
                abierto={mostrarModalPregunta} 
                titulo="¿Anular esta orden?" 
                mensaje="El stock se devolverá al inventario y se ajustará el saldo del cliente. Esta acción es definitiva."
                colorBoton="bg-red-600"
                textoBoton={anulando ? "Anulando..." : "Confirmar Anulación"}
                alConfirmar={confirmarAnulacion}
                alCerrar={() => setMostrarModalPregunta(false)}
                cargando={anulando}
            />

            {/* MODAL 2: ÉXITO */}
            <ModalBase 
                abierto={mostrarModalExito} 
                titulo="¡Orden Anulada!" 
                mensaje="La operación se realizó correctamente. El stock y la cuenta corriente han sido actualizados."
                colorBoton="bg-green-600"
                textoBoton="Entendido"
                soloOk={true}
                alConfirmar={() => setMostrarModalExito(false)}
                alCerrar={() => setMostrarModalExito(false)}
            />

            <div className="hidden"><OrdenPrint orden={orden} /></div>
        </MainLayout>
    );
}

// Componente de Modal Reutilizable
const ModalBase = ({ abierto, alConfirmar, alCerrar, titulo, mensaje, colorBoton, textoBoton, cargando, soloOk }) => {
    if (!abierto) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-white mb-2">{titulo}</h3>
                    <p className="text-gray-400 text-sm">{mensaje}</p>
                </div>
                <div className="bg-gray-800/50 p-4 flex gap-3">
                    {!soloOk && (
                        <button onClick={alCerrar} disabled={cargando} className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition">
                            Cancelar
                        </button>
                    )}
                    <button 
                        onClick={alConfirmar} 
                        className={`flex-1 px-4 py-2 ${colorBoton} text-white rounded-lg font-bold hover:brightness-110 transition`}
                    >
                        {textoBoton}
                    </button>
                </div>
            </div>
        </div>
    );
};