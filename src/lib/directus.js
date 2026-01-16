import { createDirectus, rest, realtime, staticToken } from '@directus/sdk';

const API_URL = import.meta.env.VITE_API_URL;

// Creamos una función para obtener el cliente actualizado
export const getDirectusClient = () => {
  const token = localStorage.getItem("token"); // Lee el token actual del storage
  
  return createDirectus(API_URL)
    .with(rest())
    .with(realtime())
    .with(staticToken(token));
};

// Mantenemos la exportación por defecto para compatibilidad
const client = getDirectusClient();
export default client;
