import { useState, useEffect } from "react";
import { apiFetch } from "../services/api";

export default function useTiposVehiculo() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(
          "tarifas?fields=tipo_vehiculo&limit=-1"
        );
        const uniqueTipos = [...new Set(data.data.map((t) => t.tipo_vehiculo))];
        setTipos(uniqueTipos);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTipos();
  }, []);

  return { tipos, loading, error };
}
