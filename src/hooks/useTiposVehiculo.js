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
        const result = await getItems(); // trae tarifas con servicio y tipo_vehiculo
        const data = result?.data || [];
        if (data.length) {
          const tiposUnicos = [...new Set(data.map(i => i.tipo_vehiculo))];
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
