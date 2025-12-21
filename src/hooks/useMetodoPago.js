import { useEffect, useState } from "react";
import { getMetodosPagoField } from "../services/api";

export function useMetodoPago() {
  const [metodos, setMetodos] = useState([]);

  useEffect(() => {
    const fetchMetodos = async () => {
      try {
        const opciones = await getMetodosPagoField();

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
