import { useState, useEffect } from "react";
import { getItems } from "../services/api";

export default function useItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const data = await getItems();

        if (data?.data && Array.isArray(data.data)) {
          const mapped = data.data.map(i => ({
            id: i.id,
            tarifaId: i.tarifa?.id || "",
            servicio: i.tarifa?.servicio?.nombre || "",
            tipo_vehiculo: i.tarifa?.tipo_vehiculo || "",
            precio_unitario: i.tarifa?.precio || 0,
          }));
          setItems(mapped);
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
  }, []);

  return { items, loading, error };
}
