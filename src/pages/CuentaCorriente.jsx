import { useState, useEffect, useMemo } from "react";
import MainLayout from "../layouts/MainLayout";
import { getCuentaCorriente } from "../services/api"; // <-- nueva API
import CuentaCorrienteTable from "../components/CuentaCorrienteTable";
import CuentaCorrienteModal from "../components/CuentaCorrienteModal";
import Filters from "../components/Filters";

export default function CuentaCorriente() {
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detalleCliente, setDetalleCliente] = useState(null);
  const [filtroDeuda, setFiltroDeuda] = useState(false);
  const [searchNombre, setSearchNombre] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getCuentaCorriente({
        fields: "id,saldo,saldo_actualizado,total_ordenes,total_pagos,cliente.id,cliente.nombre",
        actives: true, // solo cuentas activas
      });

      // 🔧 Normalizamos los valores numéricos
      const cuentasNormalizadas = (res.data || []).map(c => ({
        ...c,
        saldo: Number(c.saldo || 0),
        saldo_actualizado: Number(c.saldo_actualizado || 0),
        total_ordenes: Number(c.total_ordenes || 0),
        total_pagos: Number(c.total_pagos || 0),
      }));

      setCuentas(cuentasNormalizadas);
    } catch (error) {
      console.error("Error cargando cuenta corriente:", error);
      alert("Error cargando cuenta corriente. Revisa tu sesión o permisos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= FILTROS =================
  const cuentasFiltradas = useMemo(() => {
    let res = filtroDeuda ? cuentas.filter(c => c.saldo > 0) : cuentas;

    if (searchNombre) {
      res = res.filter(c =>
        c.cliente?.nombre?.toLowerCase().includes(searchNombre.toLowerCase())
      );
    }

    if (fechaDesde || fechaHasta) {
      res = res.filter(c => {
        const fecha = new Date(c.date_created); // asegúrate que este campo exista en la colección
        if (fechaDesde && fecha < new Date(fechaDesde)) return false;
        if (fechaHasta && fecha > new Date(fechaHasta)) return false;
        return true;
      });
    }

    return res.sort((a, b) =>
      (a.cliente?.nombre || "").localeCompare(b.cliente?.nombre || "")
    );
  }, [cuentas, filtroDeuda, searchNombre, fechaDesde, fechaHasta]);

  if (loading) {
    return (
      <MainLayout>
        <p>Cargando cuenta corriente...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">Cuenta Corriente de Clientes</h1>

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

      {/* MOBILE */}
      <div className="space-y-4 md:hidden">
        {cuentasFiltradas.length === 0 && (
          <p className="text-center text-gray-400">No hay clientes con cuenta corriente</p>
        )}

        {cuentasFiltradas.map(c => (
          <div key={c.id} className="bg-gray-800 rounded-lg p-4 shadow">
            <p className="font-semibold text-lg mb-1">{c.cliente?.nombre}</p>
            <div className="grid grid-cols-2 gap-2 text-sm mt-3">
              <div>
                <span className="text-gray-400">Total</span>
                <p>${c.total_ordenes.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-400">Pagado</span>
                <p>${c.total_pagos.toFixed(2)}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400">Saldo</span>
                <p
                  className={`font-semibold ${
                    c.saldo > 0 ? "text-red-400" : "text-green-400"
                  }`}
                >
                  ${c.saldo.toFixed(2)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setDetalleCliente(c)}
              className="mt-4 w-full bg-blue-600 py-2 rounded font-semibold"
            >
              Ver detalle
            </button>
          </div>
        ))}
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block">
        <CuentaCorrienteTable
          clientes={cuentasFiltradas.map(c => ({
            id: c.id,
            nombre: c.cliente?.nombre,
            total: c.total_ordenes,
            pagado: c.total_pagos,
            saldo: c.saldo,
            ordenes: c.ordenes || [],
            pagos: c.pagos || [],
          }))}
          onVerDetalle={setDetalleCliente}
        />
      </div>

      {detalleCliente && (
        <CuentaCorrienteModal
          cliente={detalleCliente}
          onClose={() => setDetalleCliente(null)}
          onPagoRegistrado={fetchData} // refresca la lista
        />
      )}
    </MainLayout>
  );
}