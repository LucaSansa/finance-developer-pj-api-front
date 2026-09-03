// import axios, {type AxiosRequestConfig} from "axios";
// import { useSession } from "../stores/session";
// import {authRefreshService} from './auth/refresh';

// const baseURL = import.meta.env.VITE_API_BASE_URL;

// // "api" é o cliente HTTP da aplicação — toda chamada ao backend passa por aqui.
// // withCredentials: true faz o browser enviar o cookie httpOnly automaticamente em cada request.
// export const api = axios.create({
//   baseURL,
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Controle para evitar que múltiplas requests disparem o refresh ao mesmo tempo.
// // true = já existe um refresh em andamento, não dispare outro.
// let isRefreshing = false;

// // Cada item da fila é uma promise pausada esperando o refresh terminar.
// // resolve = "pode continuar com o novo token"
// // reject  = "deu errado, cancela tudo"
// type QueueItem = {
//   resolve: (token: string) => void;
//   reject: (token: unknown) => void;
// }

// // Lista de requests que chegaram com 401 enquanto o refresh estava acontecendo.
// let failedQueue: QueueItem[] = [];

// // Percorre a fila e resolve ou rejeita cada promise pausada.
// // Chamada depois que o refresh termina (com sucesso ou falha).
// function processQueue(error: unknown, token: string | null){
//   failedQueue.forEach((item) => {
//     if(error) {
//       // refresh falhou — cancela cada request pausada com o mesmo erro
//       item.reject(error);
//     }else{
//       // refresh ok — libera cada request pausada com o novo token
//       item.resolve(token!);
//     }
//   })
//   // esvazia a fila após processar
//   failedQueue = [];
// }

// // INTERCEPTOR DE REQUEST — roda antes de cada request sair para o backend.
// // Responsabilidade: colocar o access_token no cabeçalho Authorization.
// api.interceptors.request.use(
//   (config) => {
//     const { session } = useSession.getState();
//     if (session?.access_token) {
//       // adiciona "Authorization: Bearer <token>" no cabeçalho da request
//       config.headers.Authorization = `Bearer ${session.access_token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // INTERCEPTOR DE RESPOSTA — roda depois que a resposta do backend chega.
// // Responsabilidade: tratar o erro 401 (token expirado) fazendo o refresh.
// api.interceptors.response.use(
//   // resposta ok (2xx) — passa direto sem fazer nada
//   (response) => response,
//   async(error) => {

//     // guarda os dados da request original para repetí-la depois do refresh
//     const originalRequest = error.confg as AxiosRequestConfig & {
//       _retry?: boolean; // flag para não entrar em loop: se já retentamos, para aqui
//     };

//     const {session, user, createSession, destroySession} = useSession.getState()

//     // se o erro não for 401, ou se já tentamos retentar essa request antes,
//     // propaga o erro normalmente sem tentar refresh
//     if(error.response?.status !== 401 || originalRequest._retry){
//       return Promise.reject(error)
//     }

//     // outro refresh já está em andamento — não dispara um segundo.
//     // pausa essa request em uma promise e coloca na fila.
//     // ela será retomada quando processQueue for chamada.
//     if(isRefreshing) {
//       return new Promise<string>((resolve, reject) => {
//         failedQueue.push({resolve, reject});
//       }).then((newAcessToken) => {
//         // refresh terminou — retenta essa request com o novo token
//         originalRequest.headers = {
//           ...originalRequest.headers,
//           Authorization: `Bearer ${newAcessToken}`,
//         };
//         originalRequest._retry = true;
//         return api(originalRequest);
//       });
//     }
    
//     // marca que o refresh começou para as próximas requests não dispararem outro
//     isRefreshing = true;
//     // marca a request original para não retentar mais de uma vez
//     originalRequest._retry = true;

//     try{
//       // chama POST /auth/refresh — o cookie httpOnly é enviado automaticamente pelo browser
//       const data = await authRefreshService.refresh();

//       // salva o novo access_token em memória (user não muda, só o token)
//       createSession({access_token: data.access_token}, user!);

//       // libera todas as requests que estavam pausadas na fila com o novo token
//       processQueue(null, data.access_token);

//       // retenta a request original que havia falhado com 401
//       originalRequest.headers = {
//         ...originalRequest.headers,
//         Authorization: `Bearer ${data.access_token}`,
//       };
//       return api(originalRequest);
//     }catch(refreshError){
//       // refresh falhou (cookie expirado ou inválido) — cancela a fila e desloga
//       processQueue(refreshError, null);
//       destroySession();
//       window.location.href = "/login";
//       return Promise.reject(refreshError)
//     }finally {
//       // independente de sucesso ou falha, libera o mutex para futuros refreshes
//       isRefreshing = false
//     }
//   }
// );


import axios, { type AxiosRequestConfig } from "axios";
import toast from "react-hot-toast";
import { useSession } from "../stores/session";
import { authRefreshService } from "./auth/refresh";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// null = nenhum refresh em andamento
// Promise = refresh já iniciado, outras requests aguardam essa mesma promise
let refreshPromise: Promise<string> | null = null;

api.interceptors.request.use((config) => {
  const { session } = useSession.getState();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    const { user, createSession, destroySession } = useSession.getState();

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // se já tem um refresh em andamento, todas as requests aguardam a mesma promise
    // em vez de disparar cada uma o seu próprio refresh
    if (!refreshPromise) {
      refreshPromise = authRefreshService
        .refresh()
        .then((data) => {
          createSession({ access_token: data.access_token }, user!);
          return data.access_token;
        })
        .catch((err) => {
          destroySession();
          toast.error("Sessão expirada. Faça login novamente.");
          window.location.href = "/login";
          throw err;
        })
        .finally(() => {
          refreshPromise = null; // libera para o próximo ciclo de expiração
        });
    }

    // aguarda o refresh (seja ele iniciado agora ou já estava em andamento)
    const newToken = await refreshPromise;

    originalRequest.headers = {
      ...originalRequest.headers,
      Authorization: `Bearer ${newToken}`,
    };
    return api(originalRequest);
  }
);