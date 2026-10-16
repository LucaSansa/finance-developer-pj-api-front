import axios, { type AxiosRequestConfig } from "axios"
import toast from "react-hot-toast"
import { useSession } from "../stores/session"
import { authRefreshService } from "./auth/refresh"

const baseURL = import.meta.env.VITE_API_BASE_URL

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

// null = nenhum refresh em andamento
// Promise = refresh já iniciado, outras requests aguardam essa mesma promise
let refreshPromise: Promise<string> | null = null

api.interceptors.request.use((config) => {
  const { session } = useSession.getState()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }
    const { user, createSession, destroySession } = useSession.getState()

    // endpoints de auth nunca devem disparar o fluxo de refresh (evita loop de 401)
    const isAuthEndpoint = originalRequest.url?.includes("/auth/")

    if (error.response?.status !== 401 || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    // se já tem um refresh em andamento, todas as requests aguardam a mesma promise
    // em vez de disparar cada uma o seu próprio refresh
    if (!refreshPromise) {
      refreshPromise = authRefreshService
        .refresh()
        .then((data) => {
          createSession({ access_token: data.access_token }, user!)
          return data.access_token
        })
        .catch((err) => {
          destroySession()
          toast.error("Sessão expirada. Faça login novamente.")
          window.location.href = "/signin"
          throw err
        })
        .finally(() => {
          refreshPromise = null // libera para o próximo ciclo de expiração
        })
    }

    // aguarda o refresh (seja ele iniciado agora ou já estava em andamento)
    const newToken = await refreshPromise

    originalRequest.headers = {
      ...originalRequest.headers,
      Authorization: `Bearer ${newToken}`,
    }
    return api(originalRequest)
  },
)
