import { useEffect, useState } from "react";
import { getServiciosConTarifas, getPreciosProductos } from "../services/api";

export default function usePrecios() {
  const [servicios, setServicios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getServiciosConTarifas(),
      getPreciosProductos(),
    ])
      .then(([serviciosRes, productosRes]) => {
        setServicios(serviciosRes.data || []);
        setProductos(productosRes.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return { servicios, productos, loading };
}
