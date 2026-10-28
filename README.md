# Finance Developer PJ — Front-end

Aplicação web para apoiar o controle financeiro de profissionais que atuam como pessoa jurídica (PJ). O front-end permite manter o perfil e acompanhar os fechamentos mensais, reunindo notas fiscais, custos operacionais e despesas pessoais em uma interface conectada à [Finance Developer PJ API](#api).

> **Status:** projeto pessoal em desenvolvimento e estudo. Este README descreve os fluxos implementados no front-end; a disponibilidade de cada operação também depende da API.

## Funcionalidades implementadas

- Cadastro de usuário com nome, CNPJ, e-mail e senha, incluindo validação dos campos e máscara de CNPJ.
- Login e encerramento de sessão.
- Confirmação e reenvio de confirmação de e-mail.
- Solicitação e confirmação de alteração de e-mail.
- Solicitação de recuperação de senha e redefinição por token.
- Renovação da sessão usando o cookie de refresh token da API.
- Consulta e edição do perfil, incluindo percentual de imposto, solicitação de alteração de e-mail e alteração de senha.
- Dashboard de fechamentos mensais, com seleção de ano, resumo por mês e navegação para criar ou editar um fechamento.
- Criação e edição de fechamentos com mês de referência, notas fiscais, custos de contabilidade e contribuição individual, percentual de imposto e despesas pessoais.
- Cálculo e apresentação dos valores arrecadados, dos custos e do saldo estimado do fechamento.
- Consulta dos tipos de despesas disponibilizados pela API.

As notas fiscais são informadas como parte dos dados operacionais do fechamento mensal. O front-end não oferece uma área independente de gerenciamento de faturas.

## Tecnologias

- React 19 e TypeScript.
- Vite 7 para desenvolvimento e build.
- React Router para navegação e proteção de rotas privadas.
- Axios para comunicação HTTP com a API.
- TanStack Query para consultas, mutações e invalidação de cache.
- Zustand com persistência para estado da sessão.
- React Hook Form e Yup para formulários e validação.
- Tailwind CSS 4 para estilos, com componentes Material UI em partes da interface.
- `react-hot-toast` para notificações e `lucide-react` para ícones.

## Pré-requisitos

- Node.js compatível com Vite 7 (Node.js 20.19+ ou 22.12+).
- npm.
- A [API](#api) em execução e acessível pelo navegador.

## Configuração local

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie um arquivo `.env` na raiz do projeto:

   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```

   `VITE_API_BASE_URL` é a URL base da API. Variáveis com prefixo `VITE_` são incorporadas ao código enviado ao navegador; não coloque segredos nesse arquivo. O `.env` é ignorado pelo Git.

3. Inicie a aplicação em modo de desenvolvimento:

   ```bash
   npm run dev
   ```

   Por padrão, o Vite disponibiliza o front-end em `http://localhost:5173`, origem aceita pela configuração de CORS descrita pela API.

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento do Vite. |
| `npm run build` | Executa a verificação/compilação TypeScript e gera a versão de produção em `dist/`. |
| `npm run preview` | Serve localmente o build já gerado para conferência. |
| `npm run lint` | Executa o ESLint. |

O `package.json` não define scripts de testes automatizados.

## Páginas e rotas

| Rota | Acesso | Página |
| --- | --- | --- |
| `/signin` | Público | Login |
| `/signup` | Público | Cadastro |
| `/verify-email` | Público | Orientação após cadastro e verificação de e-mail |
| `/confirmar-email` | Público | Confirmação de e-mail |
| `/resend-forgot-password` | Público | Solicitação de recuperação de senha |
| `/reset-password` | Público | Redefinição de senha |
| `/confirmar-troca-email` | Público | Confirmação de alteração de e-mail |
| `/dashboard` | Protegido | Lista de fechamentos por ano |
| `/fechamento-mensal` | Protegido | Criação de fechamento |
| `/fechamento-mensal/:id` | Protegido | Edição de fechamento |
| `/profile` | Protegido | Perfil, alteração de e-mail e senha |

A rota `/` redireciona para `/dashboard`. Rotas privadas exigem uma sessão autenticada; sem ela, o usuário é direcionado para `/signin`.

## Comunicação com a API

A URL base das requisições é configurada por `VITE_API_BASE_URL`. O cliente Axios envia cookies com `withCredentials` e acrescenta o token de acesso às requisições autenticadas. Quando uma chamada protegida recebe `401`, o front-end tenta renovar a sessão e repetir a chamada; se a renovação falhar, encerra a sessão e direciona o usuário ao login.

As chamadas estão agrupadas em `src/services/`:

- `auth/`: cadastro, login, logout, refresh, confirmação de e-mail, recuperação de senha e confirmação de alteração de e-mail.
- `user/`: consulta e atualização do perfil, solicitação de alteração de e-mail e alteração de senha.
- `monthlyClosing/`: listagem paginada e filtrada, consulta individual, criação e atualização de fechamentos.
- `expenseTypes/`: consulta dos tipos de despesas pessoais.

O front-end consome a API descrita no README do projeto correspondente. A API precisa estar em execução, e sua configuração de CORS deve permitir a origem do front-end e credenciais. A documentação da API informa que `http://localhost:5173` é a origem permitida atualmente.

## Organização do código

```text
src/
├── components/     # Componentes reutilizáveis de interface e formulários
├── pages/
│   ├── private/    # Dashboard, fechamento mensal e perfil
│   └── public/     # Autenticação, cadastro e fluxos de e-mail/senha
├── routes/         # Definição das rotas públicas e protegidas
├── services/       # Cliente HTTP e integração com os endpoints da API
├── stores/         # Estado global da sessão do usuário
└── utils/
    ├── schemas/    # Esquemas Yup dos formulários
    └── ...         # Máscaras, formatação e funções auxiliares
```

O estado da sessão é gerenciado em `src/stores/session/`. Apenas os dados do usuário são persistidos no armazenamento local; o token de acesso fica em memória. O TanStack Query mantém os dados remotos em cache e atualiza as consultas relacionadas após mutações.

## Build e publicação

Gere os arquivos estáticos com:

```bash
npm run build
```

O resultado fica em `dist/`. Configure `VITE_API_BASE_URL` para a URL da API usada no ambiente de publicação e habilite no servidor web o fallback de rotas para `index.html`, necessário para as rotas do React Router quando acessadas diretamente.

## API

O front-end foi desenvolvido para consumir a [Finance Developer PJ API](https://github.com/LucaSansa/finance-developer-pj-api/tree/main), uma API REST em NestJS e PostgreSQL. Consulte o README da API para instruções de instalação, configuração de banco e e-mail, endpoints e ambiente Docker Compose. O backend é um projeto separado e não é iniciado pelos comandos deste repositório.

## Licença

O `package.json` declara a licença como `UNLICENSED`; portanto, este projeto não declara uma licença de uso ou redistribuição.
