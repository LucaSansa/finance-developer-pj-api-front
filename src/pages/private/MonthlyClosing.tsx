import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Controller, useWatch } from "react-hook-form";
import { CircularProgress } from "@mui/material";
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
import { BalanceBar } from "../../components/balanceBar";
import { convertCurrencyToNumber } from "../../utils/convertCurrencyToNumber";
import { formatCurrencyBRL } from "../../utils/formatCurrencyBRL";

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
    amountCollectedValue,
    totalInvoiceTax,
    totalInvoiceTaxValue,
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

  const [accountFeeField, individualContributionField] = useWatch({
    control,
    name: ["accountFee", "individualContribution"],
  });

  const operationalTotal =
    convertCurrencyToNumber(accountFeeField) +
    convertCurrencyToNumber(individualContributionField) +
    totalInvoiceTaxValue;
  const expensesTotal = expenses.reduce(
    (total, expense) => total + convertCurrencyToNumber(expense.value),
    0
  );
  const remaining = amountCollectedValue - (operationalTotal + expensesTotal);

  return (
    <Layout>
      <div className="relative">
        {isLoading && isEditing && (
          <div className="absolute inset-0 bg-canvas/80 flex items-center justify-center rounded-panel z-10">
            <CircularProgress sx={{ color: "var(--color-brand)" }} />
          </div>
        )}

        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-ink tracking-tight">
              {isEditing ? "Editar fechamento" : "Novo fechamento"}
            </h1>
            <p className="text-sm text-ink-faint">Ano de referência {year}</p>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="h-10 px-4 rounded-control border border-line bg-surface text-sm font-medium text-ink-soft hover:border-line-strong transition-colors"
          >
            Voltar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
          <div className="flex flex-col gap-6 bg-surface border border-line-soft rounded-panel shadow-card p-6">
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

            <section className="flex flex-col gap-4 pt-6 border-t border-line">
              <div>
                <h2 className="text-base font-semibold text-ink">Nota fiscal</h2>
                <p className="text-xs text-ink-faint mt-0.5">
                  Adicione o valor de cada nota fiscal emitida no mês.
                </p>
              </div>

              <InvoiceInput addInvoice={addInvoice} />
              <InvoicesTable invoices={invoices} onRemove={removeInvoice} />
            </section>

            <section className="flex flex-col gap-4 pt-6 border-t border-line">
              <div>
                <h2 className="text-base font-semibold text-ink">Custo operacional PJ</h2>
                <p className="text-xs text-ink-faint mt-0.5">
                  Contabilidade, contribuição individual e imposto sobre as notas do mês.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              <div className="flex flex-col gap-1.5 sm:w-1/2">
                <span className="text-sm font-medium text-ink-soft">Imposto sobre a nota</span>
                <Input value={totalInvoiceTax} disabled readOnly />
              </div>
            </section>

            <section className="flex flex-col gap-4 pt-6 border-t border-line">
              <div>
                <h2 className="text-base font-semibold text-ink">Gastos pessoais</h2>
                <p className="text-xs text-ink-faint mt-0.5">
                  Registre as despesas pessoais cobertas com esse fechamento.
                </p>
              </div>
              <PersonealExpensesInput addType={addExpense} />
              <ExpensesTable expenses={expenses} onRemove={removeExpense} />
            </section>

            <div className="flex justify-end gap-3 pt-2 lg:hidden">
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

          {/* Resumo ao vivo — mesma assinatura visual do card do mês */}
          <div className="lg:sticky lg:top-8 flex flex-col gap-5 bg-ink rounded-panel shadow-panel p-6 text-white">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-white/50 uppercase tracking-wide">
                Resumo do fechamento
              </span>
              <span className="text-3xl font-semibold tabular-nums tracking-tight">
                {formatCurrencyBRL(amountCollectedValue)}
              </span>
            </div>

            <BalanceBar
              collected={amountCollectedValue}
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
                  value: expensesTotal,
                  trackClass: "bg-expense",
                  dotClass: "bg-expense",
                },
              ]}
            />

            <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Operacional PJ</span>
                <span className="text-sm font-semibold tabular-nums">{formatCurrencyBRL(operationalTotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Despesas pessoais</span>
                <span className="text-sm font-semibold tabular-nums">{formatCurrencyBRL(expensesTotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Saldo restante</span>
                <span
                  className={`text-sm font-semibold tabular-nums ${
                    remaining < 0 ? "text-expense" : "text-income"
                  }`}
                >
                  {formatCurrencyBRL(remaining)}
                </span>
              </div>
            </div>

            <div className="hidden lg:flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleCancel}
                className="h-10 px-4 rounded-control border border-white/15 text-sm font-medium text-white/80 hover:border-white/30 transition-colors"
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
    </Layout>
  );
}
