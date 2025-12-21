import { useEffect, useState } from "react";
import {apiFetch} from "../services/api"; // tu cliente axios/fetch hacia Directus

export function useMetodoPago() {
  const [metodos, setMetodos] = useState([]);

  useEffect(() => {
    const fetchMetodos = async () => {
      try {
        const res = await api.get("/fields/pagos/metodo_pago");
        const opciones = res.data?.meta?.options || [];
        // Filtrás solo los de contado (sin cuenta corriente)
        const filtrados = opciones.filter(
          (opt) => opt.value !== "cuenta_corriente"
        );
        setMetodos(filtrados);
      } catch (err) {
        console.error("Error cargando métodos de pago:", err);
      }
    };
    fetchMetodos();
  }, []);

  return metodos;
}