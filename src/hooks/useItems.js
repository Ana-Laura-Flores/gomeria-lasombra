import { useState, useEffect } from "react";
import { apiFetch } from "../services/api";

export default function useItems(tipoVehiculo) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);

        const data = await apiFetch(
          "tarifas?fields=id,precio,tipo_vehiculo,servicio.id,servicio.nombre"
        );

        if (data?.data && Array.isArray(data.data)) {
          const filtered = data.data
            .filter(t => t.tipo_vehiculo === tipoVehiculo) // filtra por tipo de vehículo
            .map(t => ({
              id: t.id,
              servicio: t.servicio?.nombre || "",
              precio: t.precio,
              tipo_vehiculo: t.tipo_vehiculo,
            }));

          setItems(filtered);
        } else {
          setItems([]);
        }

      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [tipoVehiculo]);

  return { items, loading, error };
}
