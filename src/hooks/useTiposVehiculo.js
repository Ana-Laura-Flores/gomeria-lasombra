import { useState, useEffect } from "react";
import { getTarifas } from "../services/api"; // ahora apunta a tarifas

export default function useTiposVehiculo() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        setLoading(true);

        const result = await getTarifas();
        const data = Array.isArray(result?.data) ? result.data : [];

        const tiposUnicos = [...new Set(
          data.map(t => t.tipo_vehiculo).filter(Boolean)
        )];

        setTipos(tiposUnicos);
      } catch (err) {
        console.error("Error cargando tipos de vehículo:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTipos();
  }, []);

  return { tipos, loading, error };
}