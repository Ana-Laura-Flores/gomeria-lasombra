import { useState, useEffect, useMemo } from "react";
import MainLayout from "../layouts/MainLayout";
import { getOrdenesTrabajo, getPagosPorMes } from "../services/api";
import CuentaCorrienteTable from "../components/CuentaCorrienteTable";
import CuentaCorrienteModal from "../components/CuentaCorrienteModal";
import Filters from "../components/Filters";
import { useLocation } from "react-router-dom";

export default function CuentaCorriente() {
    const [ordenes, setOrdenes] = useState([]);
    const [pagos, setPagos] = useState([]);

    const [loading, setLoading] = useState(true);
    const [clienteDetalleId, setClienteDetalleId] = useState(null);

    const [filtroDeuda, setFiltroDeuda] = useState(false);
    const [searchNombre, setSearchNombre] = useState("");
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");
    const location = useLocation();
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resOrdenes, resPagos] = await Promise.all([
                getOrdenesTrabajo(),
                getPagosPorMes("1900-01-01", "2100-01-01"),
            ]);

            const ordenesCC = resOrdenes.data.filter(
                (o) => o.condicion_cobro === "cuenta_corriente"
            );

            const pagosConfirmados = resPagos.data.filter(
                (p) => p.estado === "confirmado"
            );

            setOrdenes(ordenesCC);
            setPagos(pagosConfirmados);
        } catch (error) {
            console.error("Error cargando cuenta corriente:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [refreshKey, location.state?.refresh]);

    // ================= AGRUPAR POR CLIENTE =================
    // ================= AGRUPAR POR CLIENTE =================
    const clientesCC = useMemo(() => {
        const acc = {};

        // ÓRDENES
        ordenes.forEach((o) => {
            if (!o.cliente) return; // ✅ BIEN

            if (
                (fechaDesde && new Date(o.fecha) < new Date(fechaDesde)) ||
                (fechaHasta && new Date(o.fecha) > new Date(fechaHasta))
            ) {
                return;
            }

            const id = o.cliente.id;

            if (!acc[id]) {
                acc[id] = {
                    id,
                    nombre: o.cliente.nombre,
                    total: 0,
                    pagado: 0,
                    saldo: 0,
                    ordenes: [],
                    pagos: [],
                };
            }

            acc[id].total += Number(o.total);
            acc[id].ordenes.push(o);
        });

        // PAGOS
        pagos.forEach((p) => {
            if (!p.cliente) return; // ✅ TAMBIÉN ACÁ

            const id = p.cliente.id;

            if (!acc[id]) {
                acc[id] = {
                    id,
                    nombre: p.cliente.nombre,
                    total: 0,
                    pagado: 0,
                    saldo: 0,
                    ordenes: [],
                    pagos: [],
                };
            }

            acc[id].pagado += Number(p.monto);
            acc[id].pagos.push(p);
        });

        // SALDO FINAL
        Object.values(acc).forEach((c) => {
            c.saldo = c.total - c.pagado;
        });

        return Object.values(acc);
    }, [ordenes, pagos, fechaDesde, fechaHasta]);

    const clienteDetalle = useMemo(() => {
        if (!clienteDetalleId) return null;
        return clientesCC.find((c) => c.id === clienteDetalleId);
    }, [clienteDetalleId, clientesCC]);

    // ================= FILTROS =================
    const clientesFiltrados = useMemo(() => {
        let res = filtroDeuda
            ? clientesCC.filter((c) => c.saldo > 0)
            : clientesCC;

        if (searchNombre) {
            res = res.filter((c) =>
                c.nombre.toLowerCase().includes(searchNombre.toLowerCase())
            );
        }

        return res.sort((a, b) =>
            (a.nombre || "").localeCompare(b.nombre || "")
        );
    }, [clientesCC, filtroDeuda, searchNombre]);

    if (loading) {
        return (
            <MainLayout>
                <p>Cargando cuenta corriente...</p>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <h1 className="text-2xl font-bold mb-4">
                Cuenta Corriente de Clientes
            </h1>

            {/* ================= FILTROS ================= */}
            <Filters
                filtroDeuda={filtroDeuda}
                setFiltroDeuda={setFiltroDeuda}
                searchNombre={searchNombre}
                setSearchNombre={setSearchNombre}
                fechaDesde={fechaDesde}
                setFechaDesde={setFechaDesde}
                fechaHasta={fechaHasta}
                setFechaHasta={setFechaHasta}
            />

            {/* ================= MOBILE: CARDS ================= */}
            <div className="space-y-4 md:hidden">
                {clientesFiltrados.length === 0 && (
                    <p className="text-center text-gray-400">
                        No hay clientes con cuenta corriente
                    </p>
                )}

                {clientesFiltrados.map((cliente) => (
                    <div
                        key={cliente.id}
                        className="bg-gray-800 rounded-lg p-4 shadow"
                    >
                        <p className="font-semibold text-lg mb-1">
                            {cliente.nombre}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                            <div>
                                <span className="text-gray-400">Total</span>
                                <p>${cliente.total.toFixed(2)}</p>
                            </div>

                            <div>
                                <span className="text-gray-400">Pagado</span>
                                <p>${cliente.pagado.toFixed(2)}</p>
                            </div>

                            <div className="col-span-2">
                                <span className="text-gray-400">Saldo</span>
                                <p
                                    className={`font-semibold ${
                                        cliente.saldo > 0
                                            ? "text-red-400"
                                            : "text-green-400"
                                    }`}
                                >
                                    ${cliente.saldo.toFixed(2)}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setClienteDetalleId(cliente.id)}
                            className="mt-4 w-full bg-blue-600 py-2 rounded font-semibold"
                        >
                            Ver detalle
                        </button>
                    </div>
                ))}
            </div>

            {/* ================= DESKTOP: TABLA ================= */}
            <div className="hidden md:block">
                <CuentaCorrienteTable
                    clientes={clientesFiltrados}
                    onVerDetalle={(cliente) => setClienteDetalleId(cliente.id)}
                />
            </div>

            {/* ================= MODAL ================= */}
            {clienteDetalle && (
                <CuentaCorrienteModal
                    cliente={clienteDetalle}
                    onClose={() => setClienteDetalleId(null)}
                    onPagoRegistrado={() => {
                        setRefreshKey((k) => k + 1);
                    }}
                />
            )}
        </MainLayout>
    );
}
