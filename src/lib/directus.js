import { createDirectus, rest, realtime, staticToken } from '@directus/sdk';

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

const client = createDirectus(API_URL)
  .with(rest())
  .with(realtime())
  .with(staticToken(token)); // Esto vincula tu sesión actual

export default client;
