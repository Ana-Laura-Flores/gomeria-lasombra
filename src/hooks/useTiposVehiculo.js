import { useState, useEffect } from "react";
import { getItems } from "../services/api";

export default function useTiposVehiculo() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        setLoading(true);

        // getItems debe traer las tarifas con el campo tipo_vehiculo
        const result = await getItems();
        const data = result?.data || [];

        if (data.length) {
          // Sacar tipos únicos de las tarifas
          const tiposUnicos = [...new Set(data.map(item => item.tipo_vehiculo).filter(Boolean))];
          setTipos(tiposUnicos);
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
