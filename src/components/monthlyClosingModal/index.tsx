import { Controller } from "react-hook-form";
import { CircularProgress, Divider } from "@mui/material";
import { Select } from "../select";
import { months } from "../../utils/months";
import { PersonealExpensesInput } from "../personalExpensesInput";

import { useMonthlyClosingModal } from "./useMonthlyClosingModal";
import { ExpensesTable } from "./ExpensesTable";
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
      <div className="relative bg-white p-6 rounded-lg w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2 max-h-[90vh] overflow-auto">
        {isLoading && isEditing && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg z-10">
            <CircularProgress />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">
              {isEditing ? "Editar Fechamento" : "Novo Fechamento"}
            </h2>
            <span className="text-lg font-semibold">{year}</span>
          </div>

          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span>Mês</span>
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

              <CurrencyField
                label="Valor arrecadado"
                name="amountCollected"
                control={control}
                error={errors.amountCollected?.message}
              />
            </div>

            <Divider />

            <section>
              <h2 className="text-lg font-semibold mb-4">Custo Operacional PJ</h2>
              <div className="flex flex-col gap-4">
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
                <CurrencyField
                  label="Imposto sobre a nota"
                  name="totalInvoiceTax"
                  control={control}
                  error={errors.totalInvoiceTax?.message}
                />
              </div>
            </section>

            <Divider />

            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Gastos pessoais</h2>
              <PersonealExpensesInput addType={addExpense} />
              <ExpensesTable expenses={expenses} onRemove={removeExpense} />
            </section>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending || (isEditing && !hasChanges)}
                className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
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
