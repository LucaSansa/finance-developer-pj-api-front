# Tutorial: Implementação de Refresh Token com Segurança

## 1. Diagnóstico do Fluxo Atual

### O que acontece hoje

```
Login → POST /auth/login → { user, token }
         └─ createSession({ token, user })
              └─ Zustand persist → localStorage["session-storage"]
                                       └─ token visível em DevTools > Application
```

**Toda request:**
```
Request → interceptor lê token do Zustand → Authorization: Bearer <token>
401     → destroySession() + redirect /login  (sem tentativa de refresh)
```

### Problemas identificados

| Problema | Causa | Risco |
|---|---|---|
| Token visível no navegador | `persist` do Zustand grava em `localStorage` por padrão | XSS pode ler `localStorage` e roubar o token |
| Sem refresh token | API só retornava um `token` | Usuário perde sessão assim que o token expira |
| Sem retry após 401 | Resposta 401 imediatamente destrói sessão | UX ruim; qualquer request em segundo plano derruba o usuário |
| Múltiplos refreshes simultâneos | Não existe controle de concorrência | Race condition: várias requests disparam refresh ao mesmo tempo, invalidando tokens entre si |

---

## 2. Arquitetura Proposta

### Estratégia de armazenamento de tokens (abordagem ortodoxa)

| Token | Onde armazenar | Por quê |
|---|---|---|
| `access_token` | **Memória** (Zustand **sem** `persist`) | Não persiste em nenhum storage, invisível no DevTools, limpo ao fechar a aba |
| `refresh_token` | **Memória** (Zustand **sem** `persist`) | Mesmo nível de proteção contra XSS |
| Dados do usuário (`user`) | `sessionStorage` via persist | Pode ser persistido; não é sensível |

> **Nota sobre httpOnly cookies:** A abordagem mais segura possível é o backend gravar o `refresh_token` como cookie `httpOnly; Secure; SameSite=Strict`. Assim o frontend nunca toca no valor — ele é enviado automaticamente pelo browser. Se o backend suportar essa mudança, ela é preferível. O tutorial cobre a abordagem via memória (agnóstica ao backend).

### Fluxo proposto

```
App init
  └─ access_token está em memória? → não → tenta silent refresh via refresh_token em memória
       └─ falhou → redirect /login

Request qualquer
  └─ interceptor de request adiciona Authorization: Bearer <access_token>
       └─ 200 → resposta normal
       └─ 401 → interceptor de resposta:
            ├─ já está fazendo refresh? → enfileira a request (Promise pendente)
            └─ não está fazendo refresh?
                 └─ isRefreshing = true
                      └─ POST /auth/refresh { refresh_token }
                           ├─ sucesso → salva novos tokens na memória
                           │             → retenta todas as requests da fila com novo access_token
                           │             → retenta a request original
                           └─ falhou → limpa fila → destroySession() → redirect /login
```

---

## 3. Implementação Passo a Passo

### Passo 1 — Atualizar os tipos da sessão

**Arquivo:** `src/stores/session/types.ts`

```ts
type User = {
  name: string;
  email: string;
  cnpj: string;
};

export type Session = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type UseSession = {
  session: Session | null;
  createSession: (session: Session) => void;
  destroySession: () => void;
};
```

---

### Passo 2 — Refatorar o store de sessão

**Arquivo:** `src/stores/session/index.ts`

Remover `persist` para que `accessToken` e `refreshToken` nunca toquem o `localStorage`.
Persistir apenas `user` se quiser restaurar nome/email após reload (opcional).

```ts
import { create } from "zustand";
import type { UseSession } from "./types";

// Sem persist — tokens existem apenas em memória
export const useSession = create<UseSession>()((set) => ({
  session: null,
  createSession: (session) => set({ session }),
  destroySession: () => set({ session: null }),
}));
```

> Se precisar mostrar nome do usuário após um F5 sem re-login, persista apenas `user`
> usando o campo `partialize` do `persist`:
> ```ts
> persist(
>   (set) => ({ ... }),
>   {
>     name: "session-user",
>     partialize: (state) => ({
>       session: state.session ? { user: state.session.user } : null,
>     }),
>   }
> )
> ```
> Mesmo assim, os tokens **nunca** entram no storage.

---

### Passo 3 — Criar o serviço de refresh

**Arquivo:** `src/services/auth/refresh/index.ts`  
*(arquivo novo)*

```ts
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

// Instância separada para o refresh — NÃO usa o interceptor principal
// (evita loop: 401 no refresh → tenta refresh do refresh → infinito)
const refreshApi = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

export const authRefreshService = {
  refresh: async (refreshToken: string): Promise<RefreshResponse> => {
    const response = await refreshApi.post<RefreshResponse>("/auth/refresh", {
      refresh_token: refreshToken,
    });
    return response.data;
  },
};
```

---

### Passo 4 — Refatorar o serviço principal com fila de refresh

**Arquivo:** `src/services/index.ts`

Este é o núcleo da mudança. O padrão usa:
- `isRefreshing` — mutex simples para evitar múltiplos refreshes simultâneos
- `failedQueue` — fila de promises pendentes enquanto o refresh acontece

```ts
import axios, { type AxiosRequestConfig } from "axios";
import { useSession } from "../stores/session";
import { authRefreshService } from "./auth/refresh";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// --- Controle de concorrência do refresh ---
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

// --- Interceptor de request: injeta access_token ---
api.interceptors.request.use(
  (config) => {
    const { session } = useSession.getState();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Interceptor de resposta: trata 401 com refresh ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    const { session, createSession, destroySession } = useSession.getState();

    // Só tenta refresh em 401 e apenas uma vez por request
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Sem refresh_token em memória → não há como renovar
    if (!session?.refreshToken) {
      destroySession();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Já existe um refresh em andamento → enfileira esta request
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

    // Inicia o refresh
    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const data = await authRefreshService.refresh(session.refreshToken);

      // Atualiza os tokens em memória mantendo os dados do usuário
      createSession({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        user: session.user,
      });

      // Libera a fila com o novo access_token
      processQueue(null, data.access_token);

      // Retenta a request original com o novo token
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

---

### Passo 5 — Atualizar o serviço de login

**Arquivo:** `src/services/auth/login/index.ts`

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
  refresh_token: string;
}

export const loginService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  },
};
```

---

### Passo 6 — Atualizar Login.tsx

**Arquivo:** `src/pages/public/Login.tsx`

Trocar as referências de `token` para `accessToken`/`refreshToken` e `access_token`/`refresh_token`:

```ts
// onSuccess do loginMutation:
onSuccess: (data) => {
  createSession({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    user: data.user,
  });
  navigate("/dashboard");
},
```

```ts
// useEffect de guard:
useEffect(() => {
  if (session?.accessToken) {
    navigate("/dashboard", { replace: true });
  }
}, [session, navigate]);
```

---

### Passo 7 — Atualizar ProtectedRoute.tsx

**Arquivo:** `src/routes/ProtectedRoute.tsx`

```ts
if (!session?.accessToken) {
  return <Navigate to="/login" replace />;
}
```

---

## 4. Diagrama do Fluxo Final

```
Usuário faz login
     │
     ▼
POST /auth/login ──► { user, access_token, refresh_token }
     │
     ▼
createSession({ accessToken, refreshToken, user })
     │                   ▲
     │                   └── apenas em MEMÓRIA (Zustand sem persist)
     ▼
Request protegida
     │
     ▼
interceptor request: headers.Authorization = Bearer <accessToken>
     │
     ├── 200 ──► resposta normal
     │
     └── 401
          │
          ├── refreshToken ausente ──► destroySession + /login
          │
          ├── isRefreshing = true → fila de promises
          │
          └── POST /auth/refresh { refresh_token }
               │
               ├── sucesso ──► atualiza tokens em memória
               │               ──► processa fila com novo access_token
               │               ──► retenta request original
               │
               └── falhou ──► processa fila com erro
                               ──► destroySession + /login
```

---

## 5. Checklist de Validação

- [ ] Inspecionar DevTools > Application > Local Storage: não deve existir nenhum token
- [ ] Inspecionar DevTools > Application > Session Storage: apenas dados do `user` (se configurado com `partialize`)
- [ ] Simular token expirado (modificar o valor em memória via console) → deve renovar automaticamente e continuar a request
- [ ] Simular refresh_token inválido → deve redirecionar para `/login`
- [ ] Fazer múltiplas requests simultâneas com token expirado → deve fazer apenas **um** refresh e reusar o token para todas
- [ ] Recarregar a página (F5) → como os tokens são só em memória, usuário deve fazer login novamente (comportamento esperado)
