import { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { getServiciosConTarifas, getPreciosProductos } from "../services/api";
import { unirPrecios } from "../utils/precios";

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

  if (loading) return <MainLayout>Cargando precios…</MainLayout>;

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">Lista de precios</h1>

      <input
        type="text"
        placeholder="Buscar servicio o producto…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full md:w-1/2 p-2 rounded bg-gray-800 border border-gray-600"
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm bg-gray-800 rounded-lg">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-2 text-left">Nombre</th>
              <th className="p-2">Tipo</th>
              <th className="p-2 text-right">Auto</th>
              <th className="p-2 text-right">Moto</th>
              <th className="p-2 text-right">Camión</th>
              <th className="p-2 text-right">Camión chico</th>
              <th className="p-2 text-right">Ducato</th>
            </tr>
          </thead>
          <tbody>
            {precios.map((p) => (
              <tr
                key={p.id}
                className="border-t border-gray-700 hover:bg-gray-700/40"
              >
                <td className="p-2 font-medium">{p.nombre}</td>
                <td className="p-2 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      p.tipo === "Servicio"
                        ? "bg-blue-600"
                        : "bg-purple-600"
                    }`}
                  >
                    {p.tipo}
                  </span>
                </td>
                <Precio value={p.auto} />
                <Precio value={p.moto} />
                <Precio value={p.camion} />
                <Precio value={p.camion_chico} />
                <Precio value={p.ducato} />

              </tr>
            ))}

            {precios.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-400">
                  No hay resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}

function Precio({ value }) {
  if (!value) return <td className="p-2 text-right text-gray-500">—</td>;

  return (
    <td className="p-2 text-right font-semibold">
      ${Number(value).toLocaleString("es-AR")}
    </td>
  );
}
