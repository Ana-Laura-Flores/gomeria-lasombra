import { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getServiciosConTarifas, getPreciosProductos } from "../services/api";
import { unirPrecios } from "../utils/precios";

// Formateador de moneda prolijo
const formatCurrency = (val) => 
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(val);

export default function Precios() {
  const [servicios, setServicios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const [sRes, pRes] = await Promise.all([
          getServiciosConTarifas(),
          getPreciosProductos(),
        ]);
        setServicios(sRes.data || []);
        setProductos(pRes.data || []);
      } catch (e) {
        console.error("Error cargando precios", e);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const precios = useMemo(() => {
    const data = unirPrecios(servicios, productos);
    if (!search) return data;
    return data.filter((p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase())
    );
  }, [servicios, productos, search]);

  if (loading) return (
    <MainLayout>
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Lista de Precios</h1>
        <p className="text-gray-400 text-sm">Consulta rápida de tarifas por tipo de vehículo</p>
      </div>

      {/* Barra de Búsqueda */}
      <div className="relative mb-6 group">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 group-focus-within:text-blue-500">
          🔍
        </span>
        <input
          type="text"
          placeholder="Buscar servicio, cubierta o producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 pl-10 pr-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none"
        />
      </div>

      {/* Tabla Estilizada */}
      <div className="bg-gray-800/40 rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-900/50 border-b border-gray-700">
                <th className="p-4 text-[10px] uppercase font-black text-gray-500 tracking-widest">Ítem / Descripción</th>
                <th className="p-4 text-[10px] uppercase font-black text-gray-500 tracking-widest text-center">Tipo</th>
                <th className="p-4 text-[10px] uppercase font-black text-gray-500 tracking-widest text-right">🚗 Auto</th>
                <th className="p-4 text-[10px] uppercase font-black text-gray-500 tracking-widest text-right">🏍️ Moto</th>
                <th className="p-4 text-[10px] uppercase font-black text-gray-500 tracking-widest text-right">🚛 Camión</th>
                <th className="p-4 text-[10px] uppercase font-black text-gray-500 tracking-widest text-right">🚚 C. Chico</th>
                <th className="p-4 text-[10px] uppercase font-black text-gray-500 tracking-widest text-right">🚐 Ducato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {precios.map((p) => (
                <tr key={p.id} className="hover:bg-blue-600/5 transition-colors group">
                  <td className="p-4">
                    <div className="text-white font-bold group-hover:text-blue-400 transition-colors">{p.nombre}</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                        p.tipo === "Servicio"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                      }`}>
                      {p.tipo}
                    </span>
                  </td>
                  <PrecioCell value={p.auto} />
                  <PrecioCell value={p.moto} />
                  <PrecioCell value={p.camion} />
                  <PrecioCell value={p.camion_chico} />
                  <PrecioCell value={p.ducato} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {precios.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <div className="text-4xl mb-2">🔭</div>
            <p>No encontramos nada que coincida con "{search}"</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

// Sub-componente para las celdas de precio
function PrecioCell({ value }) {
  if (!value) return <td className="p-4 text-right text-gray-700 font-mono text-xs">—</td>;

  return (
    <td className="p-4 text-right">
      <span className="text-green-400 font-mono font-bold">
        {formatCurrency(value)}
      </span>
    </td>
  );
}