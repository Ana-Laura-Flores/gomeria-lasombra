import { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getServiciosConTarifas, getPreciosProductos } from "../services/api";
import { unirPrecios } from "../utils/precios";

const formatCurrency = (val) => 
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(val);

export default function Precios() {
  const [servicios, setServicios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [abiertoId, setAbiertoId] = useState(null); // Para controlar qué item está desplegado

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const [sRes, pRes] = await Promise.all([getServiciosConTarifas(), getPreciosProductos()]);
        setServicios(sRes.data || []);
        setProductos(pRes.data || []);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    cargar();
  }, []);

  const precios = useMemo(() => {
    const data = unirPrecios(servicios, productos);
    if (!search) return data;
    return data.filter((p) => p.nombre.toLowerCase().includes(search.toLowerCase()));
  }, [servicios, productos, search]);

  const toggleItem = (id) => {
    setAbiertoId(abiertoId === id ? null : id); // Si toca el mismo se cierra, si toca otro se abre
  };

  if (loading) return <MainLayout><div className="p-10 text-center text-white animate-pulse font-black uppercase tracking-widest">Cargando Precios...</div></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Lista de Precios</h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Gomería La Sombra</p>
        </div>

        {/* BUSCADOR ESTILO GOOGLE */}
        <div className="relative mb-8 shadow-2xl">
          <input
            type="text"
            placeholder="¿Qué servicio o producto buscas? (ej: Parche, Cubierta...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-4 pl-12 rounded-2xl bg-gray-800 border-2 border-gray-700 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all text-lg font-medium"
          />
          <span className="absolute left-4 top-4.5 text-xl opacity-40">🔍</span>
        </div>

        {/* LISTA DESPLEGABLE */}
        <div className="space-y-3">
          {precios.map((p) => (
            <div key={p.id} className="overflow-hidden">
              <button
                onClick={() => toggleItem(p.id)}
                className={`w-full flex justify-between items-center p-4 rounded-xl transition-all border ${
                  abiertoId === p.id 
                  ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-900/40' 
                  : 'bg-gray-800 border-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="flex flex-col items-start text-left">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full mb-1 ${
                    abiertoId === p.id ? 'bg-white text-blue-600' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {p.tipo}
                  </span>
                  <span className="text-white font-bold leading-tight uppercase tracking-tight">{p.nombre}</span>
                </div>
                <span className={`text-xl transition-transform duration-300 ${abiertoId === p.id ? 'rotate-180 text-white' : 'text-gray-500'}`}>
                  {abiertoId === p.id ? '−' : '+'}
                </span>
              </button>

              {/* PANEL DESPLEGABLE (LOS MONTOS) */}
              <div className={`transition-all duration-300 ease-in-out ${
                abiertoId === p.id ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0 pointer-events-none'
              }`}>
                <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 grid grid-cols-2 gap-3 shadow-inner">
                   <Monto label="Auto" emoji="🚗" val={p.auto} />
                   <Monto label="Moto" emoji="🏍️" val={p.moto} />
                   <Monto label="Camión" emoji="🚛" val={p.camion} />
                   <Monto label="C. Chico" emoji="🚚" val={p.camion_chico} />
                   <Monto label="Ducato" emoji="🚐" val={p.ducato} />
                </div>
              </div>
            </div>
          ))}

          {precios.length === 0 && (
            <div className="text-center py-20 text-gray-600 font-bold uppercase tracking-widest">
              No se encontraron resultados
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

function Monto({ label, emoji, val }) {
  if (!val) return null;
  return (
    <div className="flex flex-col border-b border-gray-800 pb-2 last:border-0">
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{emoji} {label}</span>
      <span className="text-green-400 font-mono text-lg font-black">{formatCurrency(val)}</span>
    </div>
  );
}