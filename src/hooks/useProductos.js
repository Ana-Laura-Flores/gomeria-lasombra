import { useEffect, useState } from "react";
import apiFetch from "../services/apiFetch";

export default function useProductos(tipoVehiculo) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tipoVehiculo) return;

    setLoading(true);

    apiFetch(
      `productos?filter[tipo_vehiculo][_eq]=${tipoVehiculo}&filter[estado][_eq]=activo`
    )
      .then((res) => setProductos(res.data || []))
      .finally(() => setLoading(false));
  }, [tipoVehiculo]);

  return { productos, loading };
}
