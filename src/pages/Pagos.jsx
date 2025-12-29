import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getOrdenTrabajoById, getPagosByOrden } from "../services/api";
import PagosForm from "../components/pagos/PagoForm";
import PagosTable from "../components/pagos/PagosTable";
import EstadoPagosBadge from "../components/pagos/EstadoPagosBadge";
import Modal from "../components/Modal"

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

    const [showModal, setShowModal] = useState(false); 

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

    const totalPagado = pagos.reduce((acc, p) => acc + Number(p.monto || 0), 0);

    const saldo = Math.max(Number(orden.total) - totalPagado, 0);

    let estado = "pendiente";
    if (totalPagado > 0 && saldo > 0) estado = "parcial";
    if (saldo === 0) estado = "pagado";

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto bg-gray-900 p-6 rounded-lg">
                {/* HEADER */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div>
                        <p className="font-semibold">Cliente</p>
                        <p>
                            {orden.cliente
                                ? `${orden.cliente.nombre} ${
                                      orden.cliente.apellido || ""
                                  }`
                                : "-"}
                        </p>
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
                        <p className="text-red-400 font-bold">
                            {formatMoney(saldo)}
                        </p>
                    </div>

                    <div className="flex items-center">
                        <EstadoPagosBadge estado={estado} />
                    </div>
                </div>

                {/* FORM */}
                {saldo > 0 && (
  <PagosForm
    orden={orden}
    onPagoRegistrado={async () => {
  setShowModal(true);
  await fetchData();
}}
  />
)}

                {/* TABLA */}
                <PagosTable
                    pagos={pagos}
                    totalPagado={totalPagado}
                    saldo={saldo}
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
   <Modal
  open={showModal}
  title="Pago registrado"
  onClose={() => {
    setShowModal(false);
    navigate("/ordenes");
  }}
>
  <div className="flex justify-between items-start">
    <p>El pago se registró correctamente ✅</p>

    <button
      onClick={() => {
        setShowModal(false);
        navigate("/ordenes");
      }}
      className="ml-4 text-xl font-bold text-gray-400 hover:text-white"
      aria-label="Cerrar"
    >
      ✕
    </button>
  </div>
</Modal>


        </MainLayout>
    );
}
