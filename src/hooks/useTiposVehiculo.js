import { useState, useEffect } from "react";
import { getItems } from "../services/api"; // debe traer "tarifas"

export default function useTiposVehiculo() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        setLoading(true);
        const result = await getItems(); // getItems debe traer tarifas
        const data = result?.data || [];

        // sacar tipos únicos y filtrar los vacíos
        const tiposUnicos = Array.from(
          new Set(data.map(t => t.tipo_vehiculo).filter(Boolean))
        );

        setTipos(tiposUnicos);
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
