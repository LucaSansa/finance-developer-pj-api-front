import type { ExpenseItem } from "./types";

type Props = {
  expenses: ExpenseItem[];
  onRemove: (index: number) => void;
};

export function ExpensesTable({ expenses, onRemove }: Props) {
  if (expenses.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Gastos adicionados ({expenses.length})
      </p>

      <div className="flex flex-col gap-2">
        {expenses.map((expense, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
          >
            {/* Linha superior: nome + valor + botão */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                <span className="text-base font-semibold text-gray-800">{expense.name}</span>
                <span className="text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded shrink-0">
                  {expense.expenseType.name}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-base font-semibold text-gray-800">{expense.value}</span>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  title="Remover gasto"
                  className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Linha inferior: descrição */}
            {expense.description && (
              <p className="text-sm text-gray-400 mt-1 break-words">{expense.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
