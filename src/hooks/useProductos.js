import { useEffect, useState } from "react";
import { getProductos } from "../services/api";

export default function useProductos(tipoVehiculo) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tipoVehiculo) return;

    setLoading(true);

    getProductos(tipoVehiculo)
      .then((res) => setProductos(res.data || []))
      .finally(() => setLoading(false));
  }, [tipoVehiculo]);

  return { productos, loading };
}
