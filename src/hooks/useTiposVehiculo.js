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
          "tipos_vehiculo?fields=id,nombre" // Cambiar por tu colección real de tipos de vehículo
        );
        if (data?.data) {
          setTipos(data.data);
        } else {
          setTipos([]);
        }
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
