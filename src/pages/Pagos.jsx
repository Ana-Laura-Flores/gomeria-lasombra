import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getOrdenTrabajoById, getPagosByOrden, crearAnulacion } from "../services/api";
import PagosForm from "../components/pagos/PagoForm";
import PagosTable from "../components/pagos/PagosTable";
import EstadoPagosBadge from "../components/pagos/EstadoPagosBadge";
import Modal from "../components/Modal";

const formatMoney = (value) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
    }).format(Number(value) || 0);

export default function Pagos() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const ordenId = searchParams.get("orden");

    const [orden, setOrden] = useState(null);
    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showPagoModal, setShowPagoModal] = useState(false);
    const [ultimoPago, setUltimoPago] = useState(null);

    const [pagoAAnular, setPagoAAnular] = useState(null);
    const [motivo, setMotivo] = useState("");
    const [showAnulacionModal, setShowAnulacionModal] = useState(false);

    const fetchData = async () => {
        try {
            const [ordenRes, pagosRes] = await Promise.all([
                getOrdenTrabajoById(ordenId),
                getPagosByOrden(ordenId),
            ]);
            setOrden(ordenRes.data);
            setPagos(pagosRes.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (ordenId) fetchData();
    }, [ordenId]);

    if (loading) {
        return (
            <MainLayout>
                <p>Cargando pagos...</p>
            </MainLayout>
        );
    }

    if (!orden) {
        return (
            <MainLayout>
                <p className="text-red-400">Orden no encontrada</p>
            </MainLayout>
        );
    }

    const totalPagado = pagos.reduce((acc, p) => {
        if (p.tipo === "pago") return acc + Number(p.monto || 0);
        if (p.tipo === "anulacion") return acc - Number(p.monto || 0);
        return acc;
    }, 0);

    const saldo = Math.max(Number(orden.total) - totalPagado, 0);

    let estado = "pendiente";
    if (totalPagado > 0 && saldo > 0) estado = "parcial";
    if (saldo === 0) estado = "pagado";

    // Al abrir modal de anulación
    const onAnularPago = (pago) => {
        setPagoAAnular(pago);
        setMotivo("");
        setShowAnulacionModal(true);
    };

    // Confirmar anulación
    const onConfirmarAnulacion = async () => {
        if (!motivo.trim()) return alert("Debes ingresar un motivo de anulación");

        try {
            const nuevaAnulacion = await crearAnulacion({
                pagoId: pagoAAnular.id,
                ordenId: orden.id,
                clienteId: orden.cliente.id,
                monto: pagoAAnular.monto,
                motivo,
            });

            await fetchData();
            setShowAnulacionModal(false);
            setPagoAAnular(null);

            alert(`Pago ${pagoAAnular.numero_recibo} anulado correctamente.`);

            // Podés abrir el recibo de la anulación automáticamente
            // exportarPDFOrden({ elementId: "pdf-recibo-anulacion", filename: `recibo_anulacion_${nuevaAnulacion.numero_recibo}.pdf` });

        } catch (e) {
            console.error(e);
            alert("Error al anular el pago");
        }
    };

    const handleVerRecibo = (pagoId) => {
        const pago = pagos.find((p) => p.id === pagoId);
        if (!pago) return;

        exportarPDFOrden({
            elementId: "pdf-recibo",
            filename:
                pago.tipo === "anulacion"
                    ? `recibo_anulacion_${pago.numero_recibo}.pdf`
                    : `recibo_${pago.numero_recibo}.pdf`,
        });
    };

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto bg-gray-900 p-6 rounded-lg">
                {/* HEADER */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div>
                        <p className="font-semibold">Cliente</p>
                        <p>{orden.cliente ? `${orden.cliente.nombre} ${orden.cliente.apellido || ""}` : "-"}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Total</p>
                        <p>{formatMoney(orden.total)}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Pagado</p>
                        <p>{formatMoney(totalPagado)}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Saldo</p>
                        <p className="text-red-400 font-bold">{formatMoney(saldo)}</p>
                    </div>
                    <div className="flex items-center">
                        <EstadoPagosBadge estado={estado} />
                    </div>
                </div>

                {/* FORM */}
                {saldo > 0 && (
                    <PagosForm
                        cliente={orden.cliente}
                        onPagoRegistrado={async (pagosNuevos) => {
                            if (pagosNuevos?.length) {
                                setUltimoPago(pagosNuevos[pagosNuevos.length - 1]);
                                setShowPagoModal(true);
                            }
                            await fetchData();
                        }}
                    />
                )}

                {/* TABLA */}
                <PagosTable
                    pagos={pagos}
                    totalPagado={totalPagado}
                    saldo={saldo}
                    onVerRecibo={handleVerRecibo}
                    onAnularPago={onAnularPago}
                />

                <div className="mt-6">
                    <button
                        onClick={() => navigate(`/ordenes/${orden.id}`)}
                        className="px-4 py-2 bg-gray-700 rounded"
                    >
                        Volver a la orden
                    </button>
                </div>
            </div>

            {/* Modal pago registrado */}
            {ultimoPago && (
                <div style={{ display: "none" }}>
                    <ReciboPagoPDF pago={ultimoPago} cliente={orden.cliente} orden={orden} />
                </div>
            )}

            <Modal
                open={showPagoModal}
                title="Pago registrado"
                onClose={() => setShowPagoModal(false)}
                actions={
                    <>
                        {ultimoPago && (
                            <button
                                onClick={() =>
                                    exportarPDFOrden({
                                        elementId: "pdf-recibo",
                                        filename: `recibo_${ultimoPago.numero_recibo}.pdf`,
                                    })
                                }
                                className="bg-green-600 px-4 py-2 rounded"
                            >
                                Descargar recibo
                            </button>
                        )}
                        <button onClick={() => setShowPagoModal(false)} className="bg-gray-700 px-4 py-2 rounded">
                            Cerrar
                        </button>
                    </>
                }
            >
                <p>El pago se registró correctamente.</p>
            </Modal>

            {/* Modal de anulación */}
            <Modal
                open={showAnulacionModal}
                title={`Anular pago ${pagoAAnular?.numero_recibo}`}
                onClose={() => setShowAnulacionModal(false)}
                actions={
                    <>
                        <button onClick={onConfirmarAnulacion} className="bg-red-600 px-4 py-2 rounded text-white">
                            Confirmar Anulación
                        </button>
                        <button onClick={() => setShowAnulacionModal(false)} className="bg-gray-700 px-4 py-2 rounded">
                            Cancelar
                        </button>
                    </>
                }
            >
                <p>Ingrese el motivo de la anulación:</p>
                <textarea
                    className="w-full mt-2 p-2 border rounded bg-gray-800 text-white"
                    rows={3}
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                />
            </Modal>
        </MainLayout>
    );
}
