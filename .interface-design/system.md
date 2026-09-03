# Finance Developer PJ — Sistema de Design

## Intenção

- **Quem:** usuário único (dono do PJ), gerenciando o próprio fechamento mensal.
- **Feel:** entre "calmo e pessoal" e "moderno e técnico" — referências: dashboard do iCloud (superfícies claras, respiro) + Nubank (confiança, um acento de cor forte, tipografia amigável).
- **Prioridade:** telas devem ocupar a largura útil (nada de coluna central estreita); responsivo real mobile/desktop equilibrado; light mode apenas por enquanto.
- **Assinatura:** metáfora de livro-caixa — canvas = papel, ink = tinta, line = linhas pautadas. Elemento visual único: `BalanceBar` (barra de saldo segmentada mostrando arrecadado vs. operacional vs. despesas vs. saldo), reaparece no card do mês (dashboard) e no painel de resumo ao vivo (tela de cadastro).

## Tokens (definidos em `src/index.css` via `@theme`)

| Papel | Token | Uso |
| --- | --- | --- |
| Fundo da página | `bg-canvas` | body, layout |
| Fundo elevado sutil | `bg-canvas-raised` | — |
| Superfície (cards) | `bg-surface` | cards, painéis, inputs |
| Superfície recuada | `bg-surface-inset` | inputs internos, blocos "novo item" |
| Texto primário | `text-ink` | títulos, valores |
| Texto secundário | `text-ink-soft` | labels de campo |
| Texto terciário | `text-ink-faint` | legendas, descrições |
| Texto mudo | `text-ink-muted` | placeholder, disabled |
| Borda padrão | `border-line` | inputs, botões |
| Borda sutil | `border-line-soft` | separadores, cards |
| Borda forte | `border-line-strong` | hover de ênfase |
| Marca (índigo) | `bg-brand` / `text-brand` / `bg-brand-soft` | ações primárias, badges de seleção |
| Receita/saldo positivo | `bg-income` / `text-income` / `bg-income-soft` | arrecadado, saldo positivo |
| Despesa | `bg-expense` / `text-expense` / `bg-expense-soft` | despesas pessoais, erros, saldo negativo |
| Imposto/operacional | `bg-tax` / `text-tax` / `bg-tax-soft` | custo operacional PJ |

**Raio:** `rounded-control` (inputs/botões, 10px), `rounded-card` (cards, 18px), `rounded-panel` (modais/painéis, 24px).

**Sombra:** `shadow-card` (repouso), `shadow-card-hover` (hover), `shadow-panel` (modais/painel de resumo escuro).

**Tipografia:** Inter (carregada via Google Fonts no `index.html`). Números monetários sempre com `tabular-nums`.

**Profundidade:** sombras suaves + bordas de baixa opacidade (não misturar com bordas duras). Elevação whisper-quiet.

## Componentes-chave

- `src/components/balanceBar` — assinatura visual (barra de saldo segmentada). Reutilizar sempre que precisar mostrar "arrecadado vs. gasto vs. saldo".
- `src/utils/formatCurrencyBRL.ts` — formatação de número (reais) para exibição. Usar em vez de `.toFixed(2)` manual.
- `src/components/input`, `select`, `searchableSelect` — já usam os tokens acima; novos formulários devem reaproveitar esses componentes em vez de estilizar inputs soltos.

## Padrões de tela

- **Shell:** header e canvas com o mesmo fundo (`bg-canvas`), separados só por `border-line-soft` — nunca cor de fundo diferente para sidebar/header.
- **Login:** split-screen (painel de marca à esquerda em `bg-ink`, formulário à direita), oculta o painel de marca abaixo de `lg`.
- **Dashboard:** grid de cards (`MonthCard`) com `BalanceBar`; estados vazio/loading tratados explicitamente (skeleton + empty state, não só spinner).
- **Cadastro (`MonthlyClosing`):** duas colunas a partir de `lg` (`grid-cols-[1fr_380px]`) — formulário à esquerda, painel de resumo "ao vivo" (fundo `bg-ink`, texto branco) à direita, com os botões de ação duplicados (um set visível só em mobile via `lg:hidden`, outro só em desktop via `hidden lg:flex`) para manter a ação sempre visível sem duplicar visualmente.
- **Listas de itens (notas fiscais, despesas pessoais):** bloco "adicionar" com fundo `bg-surface-inset/40` e borda `border-line-soft`, seguido da tabela de itens com botão de remover circular (hover em `text-expense`/`bg-expense-soft`).

## Consistência para novas telas

- Nunca usar cores cinzas genéricas do Tailwind (`gray-*`, `blue-*`) — sempre os tokens acima.
- Todo valor monetário exibido usa `formatCurrencyBRL` ou `tabular-nums`.
- Todo componente de formulário novo deve reaproveitar `Input`/`Select`/`SearchableSelect`, não recriar estilos.
- Dark mode não implementado ainda — se for adicionado, inverter a escala `ink`/`canvas`/`line` mantendo os tokens semânticos (`income`/`expense`/`tax`/`brand`).
