import axios from "axios";
import { useSession } from "../stores/session";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const { session } = useSession.getState();
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { destroySession } = useSession.getState();
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      destroySession();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
