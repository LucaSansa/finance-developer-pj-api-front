import { formatCurrencyBRL } from "../../utils/formatCurrencyBRL";
import { months } from "../../utils/months";
import { BalanceBar } from "../balanceBar";

interface personalExpenseRegister {
  id: string;
  description: string;
  value: number;
  expenseType: {
    id: string;
    name: string;
  };
}

interface montCardProps {
  closingDate: string;
  ammountCollected: number;
  accountFee: number;
  individualContribuition: number;
  totalInvoiceTax: number;
  personalExpense: personalExpenseRegister[] | [];
  isClosing: boolean;
  onClick?: () => void;
}

function formatMonthLabel(closingDate: string) {
  const [year, month] = closingDate.split("-");
  const label = months.find((m) => m.value === month)?.label ?? month;
  return `${label} ${year}`;
}

export const MonthCard = ({
  closingDate,
  ammountCollected,
  accountFee,
  individualContribuition,
  totalInvoiceTax,
  personalExpense,
  isClosing,
  onClick,
}: montCardProps) => {
  const totalPersonalExpense = personalExpense.reduce(
    (acc, curr) => acc + curr.value,
    0
  );
  const operationalTotal = accountFee + individualContribuition + totalInvoiceTax;
  const remaining = ammountCollected - (operationalTotal + totalPersonalExpense);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-surface border border-line-soft rounded-card shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 p-5 flex flex-col gap-5 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-ink-faint uppercase tracking-wide">
            Fechamento
          </span>
          <span className="text-base font-semibold text-ink capitalize">
            {formatMonthLabel(closingDate)}
          </span>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
            isClosing ? "bg-line-soft text-ink-faint" : "bg-income-soft text-income"
          }`}
        >
          {isClosing ? "Fechado" : "Aberto"}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-ink-faint">Valor arrecadado</span>
        <span className="text-3xl font-semibold text-ink tabular-nums tracking-tight">
          {formatCurrencyBRL(ammountCollected)}
        </span>
      </div>

      <BalanceBar
        collected={ammountCollected}
        segments={[
          {
            key: "operacional",
            label: "Operacional",
            value: operationalTotal,
            trackClass: "bg-tax",
            dotClass: "bg-tax",
          },
          {
            key: "despesas",
            label: "Despesas pessoais",
            value: totalPersonalExpense,
            trackClass: "bg-expense",
            dotClass: "bg-expense",
          },
        ]}
      />

      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-line">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-medium text-ink-faint">Operacional</span>
          <span className="text-sm font-semibold text-ink tabular-nums">
            {formatCurrencyBRL(operationalTotal)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-medium text-ink-faint">Despesas</span>
          <span className="text-sm font-semibold text-ink tabular-nums">
            {formatCurrencyBRL(totalPersonalExpense)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-medium text-ink-faint">Saldo</span>
          <span
            className={`text-sm font-semibold tabular-nums ${
              remaining < 0 ? "text-expense" : "text-income"
            }`}
          >
            {formatCurrencyBRL(remaining)}
          </span>
        </div>
      </div>
    </button>
  );
};
