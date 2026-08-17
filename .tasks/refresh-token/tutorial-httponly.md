# Tutorial: Refresh Token com httpOnly Cookie

## Por que httpOnly Cookie é superior à memória

Na abordagem de memória, o `refresh_token` fica em uma variável JS — um script malicioso
injetado via XSS ainda consegue lê-lo. Com httpOnly cookie:

- O valor **nunca toca o JavaScript** — nem para leitura, nem para escrita
- O browser gerencia o envio automaticamente
- `document.cookie` não enxerga o valor

Comparação direta:

| | Memória (JS) | httpOnly Cookie |
|---|---|---|
| Legível via XSS | ✅ sim | ❌ não |
| Persiste no F5 | ❌ não | ✅ sim (até expirar) |
| Enviado automaticamente | ❌ manual (header) | ✅ pelo browser |
| Requer mudança no backend | ❌ não | ✅ sim |
| Vulnerável a CSRF | ❌ não | ⚠️ mitigado com SameSite |

---

## 1. O que o backend precisa fazer

O frontend não consegue implementar essa abordagem sozinho. O backend deve:

### 1.1 — Endpoint de login: `POST /auth/login`

Ao autenticar com sucesso, responder com:

```http
HTTP/1.1 200 OK
Content-Type: application/json
Set-Cookie: refresh_token=<valor>; HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh; Max-Age=2592000

{
  "access_token": "<jwt>",
  "user": { "name": "...", "email": "...", "cnpj": "..." }
}
```

Detalhes dos atributos do cookie:

| Atributo | Valor | Efeito |
|---|---|---|
| `HttpOnly` | — | JS não consegue ler |
| `Secure` | — | Só enviado em HTTPS |
| `SameSite=Strict` | — | Nunca enviado em requests cross-site (bloqueia CSRF) |
| `Path=/auth/refresh` | — | Cookie só vai para esse endpoint (não vaza em outras requests) |
| `Max-Age=2592000` | 30 dias | Tempo de vida do refresh_token |

### 1.2 — Endpoint de refresh: `POST /auth/refresh`

Lê o `refresh_token` do cookie (não do body). Responde com novos tokens:

```http
HTTP/1.1 200 OK
Set-Cookie: refresh_token=<novo_valor>; HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh; Max-Age=2592000

{
  "access_token": "<novo_jwt>"
}
```

> O `refresh_token` não aparece em nenhum response body — apenas no `Set-Cookie`.

### 1.3 — Endpoint de logout: `POST /auth/logout`

Invalida o token no banco e limpa o cookie:

```http
HTTP/1.1 204 No Content
Set-Cookie: refresh_token=; HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh; Max-Age=0
```

### 1.4 — CORS: permitir credentials

O backend deve aceitar credentials (cookies) explicitamente. `*` não funciona com cookies:

```
Access-Control-Allow-Credentials: true
Access-Control-Allow-Origin: https://seu-frontend.com  ← origem exata, nunca *
```

---

## 2. Mudanças no frontend

### 2.1 — Tipos da sessão

**`src/stores/session/types.ts`**

`Session` passa a ter apenas o token. `user` sobe para campo próprio em `UseSession`,
permitindo que o store persista `user` sem tocar em `Session`.

```ts
export type User = {
  name: string;
  email: string;
  cnpj: string;
};

export type Session = {
  acess_token: string;
};

export type UseSession = {
  session: Session | null;
  user: User | null;
  createSession: (session: Session, user: User) => void;
  destroySession: () => void;
};
```

### 2.2 — Store de sessão

**`src/stores/session/index.ts`**

`session` (que contém o token) fica fora do `partialize` — nunca vai para storage.
`user` é persistido separadamente via `partialize`, mantendo nome/email após F5.

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UseSession } from "./types";

export const useSession = create<UseSession>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      createSession: (session, user) => set({ session, user }),
      destroySession: () => set({ session: null, user: null }),
    }),
    {
      name: "session-user",
      // só `user` persiste — acess_token fica apenas em memória
      partialize: (state) => ({ user: state.user }),
    }
  )
);
```

> O `partialize` resolve o conflito de tipos: `Session` exige `acess_token`,
> mas o que seria persistido não teria o token. Separando `user` em campo próprio,
> o `partialize` devolve `{ user }` que é um tipo simples sem conflito.

### 2.3 — Serviço de refresh

**`src/services/auth/refresh/index.ts`**

O body da request fica vazio — o cookie é enviado automaticamente.
`withCredentials: true` é o que instrui o browser a incluir cookies.

```ts
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export interface RefreshResponse {
  access_token: string;
}

const refreshApi = axios.create({
  baseURL,
  withCredentials: true, // envia o httpOnly cookie automaticamente
  headers: { "Content-Type": "application/json" },
});

export const authRefreshService = {
  refresh: async (): Promise<RefreshResponse> => {
    const response = await refreshApi.post<RefreshResponse>("/auth/refresh");
    return response.data;
  },
};
```

### 2.4 — Serviço principal

**`src/services/index.ts`**

Diferenças em relação ao tutorial anterior:
- `withCredentials: true` na instância principal (para o login receber o cookie)
- Sem verificação de `refreshToken` em memória (não existe mais)
- `createSession` recebe dois argumentos: `session` e `user` separados

```ts
import axios, { type AxiosRequestConfig } from "axios";
import { useSession } from "../stores/session";
import { authRefreshService } from "./auth/refresh";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL,
  withCredentials: true, // necessário para o browser enviar/receber cookies
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;

type QueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let failedQueue: QueueItem[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error);
    } else {
      item.resolve(token!);
    }
  });
  failedQueue = [];
}

api.interceptors.request.use(
  (config) => {
    const { session } = useSession.getState();
    if (session?.acess_token) {
      config.headers.Authorization = `Bearer ${session.acess_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    const { session, user, createSession, destroySession } = useSession.getState();

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newAccessToken) => {
        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newAccessToken}`,
        };
        originalRequest._retry = true;
        return api(originalRequest);
      });
    }

    isRefreshing = true;
    originalRequest._retry = true;

    try {
      // cookie httpOnly é enviado automaticamente, sem passar nada no body
      const data = await authRefreshService.refresh();

      createSession({ acess_token: data.access_token }, user!);

      processQueue(null, data.access_token);

      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${data.access_token}`,
      };
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      destroySession();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
```

### 2.5 — Serviço de login

**`src/services/auth/login/index.ts`**

Response não traz mais `refresh_token` — ele já foi gravado no cookie pelo backend.

```ts
import { api } from "../../index";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    name: string;
    cnpj: string;
    email: string;
  };
  access_token: string;
}

export const loginService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  },
};
```

### 2.6 — Login.tsx

```ts
// onSuccess:
onSuccess: (data) => {
  createSession({ acess_token: data.access_token }, data.user);
  navigate("/dashboard");
},

// useEffect guard:
useEffect(() => {
  if (session?.acess_token) {
    navigate("/dashboard", { replace: true });
  }
}, [session, navigate]);
```

### 2.7 — ProtectedRoute.tsx

```ts
if (!session?.acess_token) {
  return <Navigate to="/login" replace />;
}
```

### 2.8 — Logout (novo)

Ao destruir sessão, chamar o endpoint para que o backend invalide o refresh_token
e limpe o cookie. Sem essa chamada, o cookie continua válido até o `Max-Age` expirar.

**`src/services/auth/logout/index.ts`** *(arquivo novo)*

```ts
import { api } from "../../index";

export const authLogoutService = {
  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },
};
```

Onde o logout é acionado (botão, menu, etc.):

```ts
import { authLogoutService } from "../../services/auth/logout";
import { useSession } from "../../stores/session";

const { destroySession } = useSession.getState();

await authLogoutService.logout();
destroySession();
navigate("/login");
```

---

## 3. Silent refresh na inicialização (opcional mas recomendado)

Quando o usuário recarrega a página (F5), o `acess_token` em memória é perdido,
mas o cookie httpOnly ainda existe. É possível restaurar a sessão silenciosamente:

**`src/App.tsx`** (ou no provider raiz)

```tsx
import { useEffect, useState } from "react";
import { useSession } from "./stores/session";
import { authRefreshService } from "./services/auth/refresh";
import { api } from "./services";

export function App() {
  const { createSession } = useSession();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    authRefreshService
      .refresh()
      .then((data) => {
        // busca os dados do usuário com o novo token
        return api
          .get("/auth/me", {
            headers: { Authorization: `Bearer ${data.access_token}` },
          })
          .then((res) => {
            createSession({ acess_token: data.access_token }, res.data);
          });
      })
      .catch(() => {
        // cookie ausente ou expirado — usuário precisará fazer login
      })
      .finally(() => setReady(true));
  }, []);

  if (!ready) return null; // ou um spinner global

  return <RouterProvider router={router} />;
}
```

> Se o backend não expõe `GET /auth/me`, persista apenas `user`
> no Zustand com `partialize` (sem tokens) e use-o aqui.

---

## 4. Diagrama do fluxo final

```
Browser                         Frontend JS                     Backend
  │                                  │                              │
  │── POST /auth/login ─────────────►│──────────────────────────────►│
  │                                  │                              │
  │◄── Set-Cookie: refresh_token ────│◄─────────────────────────────│
  │    (httpOnly, JS não lê)         │    { access_token, user }    │
  │                                  │                              │
  │    [cookie guardado no browser]  │  acess_token → memória JS    │
  │                                  │                              │
  │── POST /api/qualquer ───────────►│── Authorization: Bearer ─────►│
  │                                  │                              │
  │◄─────────────────────────────────│◄── 401 (token expirado) ─────│
  │                                  │                              │
  │── POST /auth/refresh ───────────►│──────────────────────────────►│
  │   (cookie enviado automaticamente│                              │
  │    pelo browser, sem JS tocar)   │◄── { access_token } ─────────│
  │◄── Set-Cookie: refresh_token novo│◄── Set-Cookie: novo cookie ──│
  │                                  │                              │
  │                                  │  novo acess_token → memória  │
  │                                  │  retenta request original    │
  │                                  │──────────────────────────────►│
```

---

## 5. Checklist de validação

- [ ] DevTools > Application > Cookies: `refresh_token` aparece com flag `HttpOnly` (sem valor legível)
- [ ] `document.cookie` no console: `refresh_token` não aparece
- [ ] DevTools > Application > Local Storage / Session Storage: nenhum token
- [ ] F5 com cookie válido: sessão é restaurada via silent refresh
- [ ] F5 com cookie expirado/ausente: redireciona para `/login`
- [ ] Logout: cookie é removido (verificar no DevTools após logout)
- [ ] Múltiplas requests com token expirado: apenas um `POST /auth/refresh` é disparado
- [ ] CORS: requests de `localhost` para a API chegam com o cookie (verificar na aba Network > Request Headers > Cookie)
