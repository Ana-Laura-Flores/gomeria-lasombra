import { useState, useEffect } from "react";
import { apiFetch } from "../services/api";

export default function useProductos(tipoVehiculo) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);

        const data = await apiFetch(
          "productos?fields=id,nombre,precio_unitario,tipo_vehiculo,stock,estado"
        );

        if (data?.data && Array.isArray(data.data)) {
          const filtered = data.data
            .filter(p => !tipoVehiculo || p.tipo_vehiculo === tipoVehiculo)
            .map(p => ({
              id: p.id,
              nombre: p.nombre,
              precio: Number(p.precio_unitario),
              stock: Number(p.stock),
              tipo_item: "producto",
              tipo_vehiculo: p.tipo_vehiculo,
            }));

          setProductos(filtered);
        } else {
          setProductos([]);
        }
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [tipoVehiculo]);

  return { productos, loading, error };
}
