import type { ExpenseItem } from "./types";

type Props = {
  expenses: ExpenseItem[];
  onRemove: (index: number) => void;
};

export function ExpensesTable({ expenses, onRemove }: Props) {
  if (expenses.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-ink-faint uppercase tracking-wide">
        Gastos adicionados ({expenses.length})
      </p>

      <div className="flex flex-col gap-2">
        {expenses.map((expense, index) => (
          <div
            key={index}
            className="border border-line-soft rounded-control px-4 py-3 bg-surface hover:border-line transition-colors"
          >
            {/* Linha superior: nome + valor + botão */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                <span className="text-sm font-semibold text-ink">{expense.name}</span>
                <span className="text-xs text-brand bg-brand-soft px-2 py-0.5 rounded-full shrink-0">
                  {expense.expenseType.name}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-semibold text-ink tabular-nums">{expense.value}</span>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  title="Remover gasto"
                  className="w-7 h-7 flex items-center justify-center rounded-full text-ink-muted hover:text-expense hover:bg-expense-soft transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Linha inferior: descrição */}
            {expense.description && (
              <p className="text-sm text-ink-faint mt-1 break-words">{expense.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
