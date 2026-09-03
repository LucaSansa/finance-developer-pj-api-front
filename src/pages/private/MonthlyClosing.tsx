import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Controller } from "react-hook-form";
import { CircularProgress, Divider } from "@mui/material";
import { Layout } from "../../components/layout";
import { Select } from "../../components/select";
import { Input } from "../../components/input";
import { months } from "../../utils/months";
import { PersonealExpensesInput } from "../../components/personalExpensesInput";
import { InvoiceInput } from "../../components/invoiceInput";
import { CurrencyField } from "../../components/monthlyClosingModal/CurrencyField";
import { ExpensesTable } from "../../components/monthlyClosingModal/ExpensesTable";
import { InvoicesTable } from "../../components/monthlyClosingModal/InvoicesTable";
import { useMonthlyClosingModal } from "../../components/monthlyClosingModal/useMonthlyClosingModal";

export function MonthlyClosing() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const year = searchParams.get("year") ?? String(new Date().getFullYear());

  const handleClose = () => navigate("/dashboard");

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
  } = useMonthlyClosingModal({
    year,
    id,
    onClose: handleClose,
  });

  const isEditing = !!id;

  return (
    <Layout>
      <div className="relative max-w-2xl mx-auto">
        {isLoading && isEditing && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg z-10">
            <CircularProgress />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {isEditing ? "Editar Fechamento" : "Novo Fechamento"}
            </h2>
            <span className="text-xl font-semibold">{year}</span>
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

              <div>
                <span>Valor arrecadado</span>
                <Input value={amountCollected} disabled readOnly />
              </div>
            </div>

            <Divider />

            <section className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Custo Operacional PJ</h2>

              <InvoiceInput addInvoice={addInvoice} />
              <InvoicesTable invoices={invoices} onRemove={removeInvoice} />

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

              <div>
                <span>Imposto sobre a nota</span>
                <Input value={totalInvoiceTax} disabled readOnly />
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
    </Layout>
  );
}
