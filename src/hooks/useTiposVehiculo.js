// src/hooks/useTiposVehiculo.js
import { useState, useEffect } from "react";
import { getItems } from "../services/api"; // getItems trae tarifas con servicio y tipo_vehiculo

export default function useTiposVehiculo() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        setLoading(true);
        const result = await getItems(); // trae tarifas con servicio y tipo_vehiculo
        const tarifas = result?.data || [];
        if (tarifas.length) {
          // extraer tipos únicos y filtrar vacíos
          const tiposUnicos = Array.from(
            new Set(tarifas.map(t => t.tipo_vehiculo).filter(Boolean))
          );
          setTipos(tiposUnicos);
        } else {
          setTipos([]);
        }
      } catch (err) {
        console.error("Error fetching tipos de vehículo:", err);
        setError(err);
        setTipos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTipos();
  }, []);

  return { tipos, loading, error };
}
