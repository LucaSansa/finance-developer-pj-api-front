---
name: create-private-base-screen
description: "Use ao criar uma tela privada nova e vazia (base) em uma rota indicada, dentro do sistema autenticado: cria a página em src/pages/private e registra a rota em PrivateRoutes, seguindo o padrão das telas privadas existentes (Layout com Header e Footer). Não adiciona conteúdo."
argument-hint: "rota (ex: /relatorios), nome da tela e título opcionais"
---

# Create private base screen

Cria uma tela base vazia de área logada na rota indicada, seguindo as telas privadas existentes. Não inventa conteúdo, serviços, textos nem estilos. Não serve para telas públicas (`src/pages/public`).

## Entradas
- **Rota** (obrigatória): se faltar, pergunte.
- **Nome da tela** (opcional): padrão é o último segmento da rota em PascalCase (`/relatorios` → `Relatorios`).
- **Título** (opcional): só use se informado.

## Padrão (confirme lendo antes de criar)
- `src/routes/PrivateRoutes.tsx`: array `privateRoutes`, cada rota dentro de `ProtectedRoute`.
- `src/components/layout/Layout.tsx`: já traz `Header`, `Footer`, largura máxima e padding; é a raiz de toda tela privada.
- `src/pages/private/Dashboard.tsx`: referência de tela.
- Estilo: um componente por arquivo, export nomeado, imports relativos, sem ponto e vírgula, aspas duplas, 2 espaços.

## Procedimento
1. Em `PrivateRoutes.tsx`, confirme que rota e nome ainda não existem; se existirem, avise e pare.
2. Crie `src/pages/private/<Nome>.tsx`:

   ```tsx
   import { Layout } from "../../components/layout/Layout"

   export function Nome() {
     return <Layout>{null}</Layout>
   }
   ```

   Com título informado, o conteúdo do `Layout` é apenas o cabeçalho do Dashboard:
   `<h1 className="text-2xl font-semibold text-ink tracking-tight">Título</h1>`

3. Em `PrivateRoutes.tsx`, importe a tela e adicione ao final do array:

   ```tsx
   {
     path: "/rota-indicada",
     element: (
       <ProtectedRoute>
         <Nome />
       </ProtectedRoute>
     ),
   },
   ```

4. Rode `npx tsc -b` e `npm run lint` e informe o resultado e os arquivos alterados.

## Regras
- Não adicione conteúdo, estado, hooks, API ou estilos extras.
- Não altere `Layout`, `Header`, `Footer`, `App.tsx` nem outras telas.
- Não crie link de navegação, a menos que seja pedido.
- Use exatamente a rota indicada.
