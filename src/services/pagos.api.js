import { apiFetch } from "./api";

export const crearPago = (data) =>
  apiFetch("pagos", {
    method: "POST",
    body: JSON.stringify(data),
  });
