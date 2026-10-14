import { Controller } from "react-hook-form";
import { CircularProgress } from "@mui/material";
import { Select } from "../select";
import { Input } from "../input";
import { months } from "../../utils/months";
import { PersonealExpensesInput } from "../personalExpensesInput";
import { InvoiceInput } from "../invoiceInput";

import { useMonthlyClosingModal } from "./useMonthlyClosingModal";
import { ExpensesTable } from "./ExpensesTable";
import { InvoicesTable } from "./InvoicesTable";
import { CurrencyField } from "./CurrencyField";

type Props = {
  year: string;
  open: boolean;
  onClose: () => void;
  id?: string;
  onError?: () => void;
};

export function MonthlyClosingModal({ open, onClose, year, id, onError }: Props) {
  const {
    control,
    errors,
    expenses,
    addExpense,
    removeExpense,
    invoices,
    addInvoice,
    removeInvoice,
    amountCollected,
    totalInvoiceTax,
    handleSubmit,
    handleCancel,
    isPending,
    isLoading,
    hasChanges,
  } = useMonthlyClosingModal({ year, id, onClose, onError });

  if (!open) return null;

  const isEditing = !!id;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) handleCancel(); }}
    >
      <div className="relative bg-surface p-6 rounded-panel shadow-panel w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2 max-h-[90vh] overflow-auto">
        {isLoading && isEditing && (
          <div className="absolute inset-0 bg-canvas/80 flex items-center justify-center rounded-panel z-10">
            <CircularProgress sx={{ color: "var(--color-brand)" }} />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-ink">
              {isEditing ? "Editar Fechamento" : "Novo Fechamento"}
            </h2>
            <span className="text-lg font-semibold text-ink">{year}</span>
          </div>

          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink-soft">Mês</span>
                <Controller
                  name="closingDate"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={months}
                      initialLabel="Selecione o mês"
                      error={errors.closingDate?.message}
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink-soft">Valor arrecadado</span>
                <Input value={amountCollected} disabled readOnly />
              </div>
            </div>

            <div className="border-t border-line" />

            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-ink">Nota fiscal</h2>
              <p className="text-xs text-ink-faint -mt-3">
                Adicione o valor de cada nota fiscal emitida no mês.
              </p>

              <InvoiceInput addInvoice={addInvoice} />
              <InvoicesTable invoices={invoices} onRemove={removeInvoice} />
            </section>

            <div className="border-t border-line" />

            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-ink">Custo Operacional PJ</h2>

              <CurrencyField
                label="Contabilidade"
                name="accountFee"
                control={control}
                error={errors.accountFee?.message}
              />
              <CurrencyField
                label="Contribuição individual"
                name="individualContribution"
                control={control}
                error={errors.individualContribution?.message}
              />

              <div className="flex flex-col gap-1.5 sm:w-1/2">
                <span className="text-sm font-medium text-ink-soft">Imposto sobre a nota</span>
                <Input value={totalInvoiceTax} disabled readOnly />
              </div>
            </section>

            <div className="border-t border-line" />

            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-ink">Gastos pessoais</h2>
              <PersonealExpensesInput addType={addExpense} />
              <ExpensesTable expenses={expenses} onRemove={removeExpense} />
            </section>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="h-10 px-4 rounded-control border border-line text-sm font-medium text-ink-soft hover:border-line-strong transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending || (isEditing && !hasChanges)}
                className="h-10 px-5 rounded-control bg-brand text-white text-sm font-medium hover:bg-brand-strong disabled:opacity-50 transition-colors"
              >
                {isPending ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
