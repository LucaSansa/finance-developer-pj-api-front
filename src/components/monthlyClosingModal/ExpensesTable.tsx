import type { ExpenseItem } from "./types";

type Props = {
  expenses: ExpenseItem[];
  onRemove: (index: number) => void;
};

export function ExpensesTable({ expenses, onRemove }: Props) {
  if (expenses.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="text-left p-2 text-sm font-semibold">Nome</th>
            <th className="text-left p-2 text-sm font-semibold">Descrição</th>
            <th className="text-left p-2 text-sm font-semibold">Tipo</th>
            <th className="text-right p-2 text-sm font-semibold">Valor</th>
            <th className="text-center p-2 text-sm font-semibold w-20">Ações</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense, index) => (
            <tr key={index} className="border-b hover:bg-gray-50">
              <td className="p-2 text-sm">{expense.name}</td>
              <td className="p-2 text-sm">{expense.description}</td>
              <td className="p-2 text-sm">{expense.expenseType.name}</td>
              <td className="p-2 text-sm text-right">{expense.value}</td>
              <td className="p-2 text-center">
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
