import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";

// Importamos las funciones necesarias de tu api.js
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
    const [mostrarModal, setMostrarModal] = useState(false); // Estado para el modal pro

    const fetchOrden = async () => {
        try {
            setLoading(true);
            const res = await getOrdenTrabajoById(id);
            setOrden(res.data || null);
        } catch (error) {
            console.error("Error cargando orden:", error);
            setOrden(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrden();
    }, [id]);

    // Esta función ahora solo abre el modal
    const solicitarAnulacion = () => {
        setMostrarModal(true);
    };

    // Esta es la función que ejecuta la acción real
    const confirmarAnulacion = async () => {
        try {
            setAnulando(true);
            
            // 1. Llamada a la API
            await anularOrdenCompleta(orden);
            
            // 2. Update Optimista (Cambiamos el estado en pantalla al instante)
            setOrden(prev => ({ ...prev, estado: 'anulado' }));
            
            // 3. Cerramos el modal y avisamos
            setMostrarModal(false);
            alert("La orden ha sido anulada y el stock actualizado.");
            
            // 4. Refrescamos datos del servidor
            await fetchOrden(); 
        } catch (error) {
            console.error("Error al anular:", error);
            alert("No se pudo anular la orden: " + error.message);
        } finally {
            setAnulando(false);
        }
    };

    const handleExportarPDF = () => {
        exportarPDFOrden({
            elementId: "orden-print",
            filename: `orden-${orden.comprobante || orden.id}-ANULADA.pdf`,
        });
    };

    if (loading && !orden) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center h-64">
                    <p className="text-white animate-pulse">Cargando orden...</p>
                </div>
            </MainLayout>
        );
    }

    if (!orden) {
        return (
            <MainLayout>
                <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-lg text-center">
                    <p className="text-red-400 mb-4">Orden no encontrada</p>
                    <button
                        onClick={() => navigate("/ordenes")}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Volver al listado
                    </button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className={`max-w-4xl mx-auto bg-gray-900 p-6 rounded-lg relative shadow-xl transition-all duration-500 ${orden.estado === 'anulado' ? 'border-2 border-red-900/50' : ''}`}>
                
                {/* Sello visual en pantalla */}
                {orden.estado === "anulado" && (
                    <div className="absolute top-40 left-1/2 -translate-x-1/2 -translate-y-1/2 border-8 border-red-600 text-red-600 px-10 py-4 text-6xl font-black uppercase -rotate-12 opacity-30 pointer-events-none z-50">
                        Anulada
                    </div>
                )}

                {/* ===== HEADER ===== */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <img src={logo} alt="Logo" className="h-12 object-contain" />
                        <div>
                            <h1 className="text-xl font-bold text-white">Gomería La Sombra</h1>
                            <p className="text-sm text-gray-400">Orden de trabajo #{orden.id}</p>
                        </div>
                    </div>
                    <div className="text-left md:text-right text-white">
                        <p><strong>Fecha:</strong> {new Date(orden.fecha).toLocaleDateString()}</p>
                        <p><strong>Comprobante:</strong> {orden.comprobante || "-"}</p>
                    </div>
                </div>

                {/* ===== DATOS DEL CLIENTE ===== */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-800 p-4 rounded-lg text-white">
                    <div>
                        <p className="text-gray-400 text-xs uppercase font-bold">Cliente</p>
                        <p>{orden.cliente ? `${orden.cliente.nombre}` : "Consumidor Final"}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs uppercase font-bold">Patente</p>
                        <p className="uppercase">{orden.patente || "-"}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs uppercase font-bold">Condición</p>
                        <span className={`text-sm ${orden.condicion_cobro === "contado" ? "text-green-400" : "text-yellow-400"}`}>
                            {orden.condicion_cobro === "contado" ? "Contado" : "Cuenta Corriente"}
                        </span>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs uppercase font-bold">Estado</p>
                        <p className={`capitalize font-bold ${orden.estado === 'anulado' ? 'text-red-500' : 'text-blue-400'}`}>
                            {orden.estado}
                        </p>
                    </div>
                </div>

                {/* ===== TABLA DE ITEMS ===== */}
                <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse mb-6 text-sm text-white">
                        <thead>
                            <tr className="border-b border-gray-700 text-gray-400 text-left">
                                <th className="px-4 py-2">Descripción</th>
                                <th className="px-4 py-2 text-right">Cant.</th>
                                <th className="px-4 py-2 text-right">Unitario</th>
                                <th className="px-4 py-2 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(orden.items_orden) && orden.items_orden.map((item) => (
                                <tr key={item.id} className={`border-b border-gray-800 hover:bg-gray-800/50 ${orden.estado === 'anulado' ? 'text-gray-500' : ''}`}>
                                    <td className="px-4 py-2">
                                        {item.tipo_item === "servicio"
                                            ? item.tarifa?.servicio?.nombre || "Servicio"
                                            : item.producto?.nombre || "Producto"}
                                    </td>
                                    <td className="px-4 py-2 text-right">{item.cantidad}</td>
                                    <td className="px-4 py-2 text-right">{formatMoney(item.precio_unitario)}</td>
                                    <td className="px-4 py-2 text-right font-semibold">{formatMoney(item.subtotal)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ===== TOTALES ===== */}
                <div className="mt-4 text-right space-y-1 text-lg font-semibold text-white">
                    <p className="text-gray-400 text-sm font-normal">Monto Final</p>
                    <p className={`text-2xl ${orden.estado === 'anulado' ? 'text-gray-500 line-through' : 'text-green-400'}`}>
                        {formatMoney(orden.total)}
                    </p>
                </div>

                {/* ===== ACCIONES ===== */}
                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-gray-800 pt-6 print:hidden">
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate("/ordenes")}
                            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                        >
                            Volver
                        </button>
                        
                        {orden.estado !== "anulado" ? (
                            <button
                                onClick={solicitarAnulacion}
                                disabled={anulando}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition font-bold"
                            >
                                Anular Orden
                            </button>
                        ) : (
                            <span className="px-4 py-2 bg-red-900/20 text-red-500 rounded border border-red-900/50 font-bold flex items-center gap-2">
                                🚫 ORDEN ANULADA
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleExportarPDF}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-2"
                    >
                        <span>{orden.estado === 'anulado' ? 'Descargar PDF (Anulado)' : 'Descargar PDF'}</span>
                    </button>
                </div>
            </div>

            {/* Modal de Confirmación Pro */}
            <ModalConfirmacion 
                abierto={mostrarModal}
                alCerrar={() => setMostrarModal(false)}
                alConfirmar={confirmarAnulacion}
                titulo="¿Confirmar Anulación de Orden?"
                mensaje="Esta acción devolverá los productos al stock y descontará el saldo de la cuenta corriente si corresponde. Esta operación es irreversible."
                cargando={anulando}
            />

            {/* Componente oculto para impresión - Le pasamos la orden para que detecte el estado anulado */}
            <div style={{ position: "absolute", top: "-9999px", left: "-9999px", visibility: "hidden" }}>
                <OrdenPrint orden={orden} />
            </div>
        </MainLayout>
    );
}

// Sub-componente Modal
const ModalConfirmacion = ({ abierto, alConfirmar, alCerrar, titulo, mensaje, cargando }) => {
    if (!abierto) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{titulo}</h3>
                    <p className="text-gray-400 leading-relaxed">{mensaje}</p>
                </div>
                <div className="bg-gray-800/50 p-4 flex justify-end gap-3">
                    <button
                        onClick={alCerrar}
                        disabled={cargando}
                        className="px-4 py-2 text-gray-400 hover:text-white transition disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={alConfirmar}
                        disabled={cargando}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {cargando ? "Procesando..." : "Sí, Anular"}
                    </button>
                </div>
            </div>
        </div>
    );
};