import { useState, useEffect } from "react";
import { getItems, getServicios } from "../services/api";

export default function useItems(tipoItem = "servicio", tipoVehiculo = "") {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        let data = [];
        if (tipoItem === "servicio") {
          const serviciosData = await getServicios();
          data = serviciosData.data
            .map((s) => {
              const tarifa = s.tarifas.find(
                (t) => t.tipo_vehiculo === tipoVehiculo
              );
              if (!tarifa) return null;
              return {
                id: tarifa.id,
                servicio: s.nombre,
                precio: tarifa.precio,
                tipo_vehiculo: tarifa.tipo_vehiculo,
              };
            })
            .filter(Boolean); // elimina nulls si no hay tarifa para el vehículo
        } else {
          // Por ahora usamos getItems para productos (en el futuro podés crear getProductos)
          const productosData = await getItems();
          data = productosData.data.map((p) => ({
            id: p.id,
            servicio: p.nombre,
            precio: p.precio_unitario || 0,
          }));
        }

        setItems(data);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tipoItem, tipoVehiculo]);

  return { items, loading, error };
}
