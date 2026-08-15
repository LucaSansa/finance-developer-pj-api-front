import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { publicRoutes } from "./routes/PublicRoutes";
import { privateRoutes } from "./routes/PrivateRoutes";
import { useSession } from "./stores/session";
import { useEffect, useState } from "react";
import { authRefreshService } from "./services/auth/refresh";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const {createSession, user} = useSession();
  const [ready, setReady] = useState(false)


    useEffect(() => {
    authRefreshService
      .refresh()
      .then((data) => {
        // busca os dados do usuário com o novo token
        // let acess_token = session?.access_token;

        return createSession({access_token: data.access_token}, user!)
        
        // return api
        //   .get("/auth/me", {
        //     headers: { Authorization: `Bearer ${data.access_token}` },
        //   })
        //   .then((res) => {
        //     createSession({ acess_token: data.access_token }, res.data);
        //   });
      })
      .catch(() => {
        // cookie ausente ou expirado — usuário precisará fazer login
      })
      .finally(() => setReady(true));
  }, [createSession, user]);

  if (!ready) return null; // ou um spinner global

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {publicRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          {privateRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
