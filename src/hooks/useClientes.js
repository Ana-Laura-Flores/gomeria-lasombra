import { useState, useEffect } from "react";
import { apiFetch } from "../services/api";

export default function useClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await apiFetch("clientes?sort=nombre");
        setClientes(res.data);
      } catch (error) {
        console.error("Error al traer clientes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  return { clientes, loading };
}
