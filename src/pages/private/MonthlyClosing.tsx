import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useState } from "react"
import { Controller, useWatch } from "react-hook-form"
import { CircularProgress } from "@mui/material"
import { Layout } from "../../components/layout/Layout"
import { Select } from "../../components/select/Select"
import { Input } from "../../components/input/Input"
import { PersonalExpensesInput } from "../../components/personalExpensesInput/PersonalExpensesInput"
import { InvoiceInput } from "../../components/invoiceInput/InvoiceInput"
import { CurrencyField } from "../../components/monthlyClosingModal/CurrencyField"
import { ExpensesTable } from "../../components/monthlyClosingModal/ExpensesTable"
import { InvoicesTable } from "../../components/monthlyClosingModal/InvoicesTable"
import { useMonthlyClosing } from "../../components/monthlyClosingModal/useMonthlyClosing"
import { BalanceBar } from "../../components/balanceBar/BalanceBar"
import { useGetOneMonthlyClosing } from "../../services/monthlyClosing"
import { useGetMe } from "../../services/user"
import { convertCurrencyToNumber } from "../../utils/convertCurrencyToNumber"
import { formatCurrencyBRL } from "../../utils/formatCurrencyBRL"
import { months } from "../../utils/months"

// Como a margem de imposto é definida: pela margem cadastrada, digitada na hora, ou sem escolha
type TaxMode = "registered" | "manual" | "none"

export function MonthlyClosing() {
  // ── Rota: sem id é um novo fechamento, com id é uma edição ──
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()

  const year = searchParams.get("year") ?? String(new Date().getFullYear())
  const isEditing = !!id

  // ── Dados da API ──
  const { data: me } = useGetMe()
  const { data: savedClosing } = useGetOneMonthlyClosing(id ?? "") // só busca quando há id

  // ── Margem de imposto ──
  const registeredTax = me?.taxPercentage // margem cadastrada no perfil (pode ser null)

  // Percentual implícito no fechamento salvo: imposto salvo ÷ valor arrecadado salvo
  const savedTax = savedClosing?.operacionalPj?.totalInvoiceTax ?? 0
  const savedAmount = savedClosing?.amountCollected ?? 0
  const savedTaxPercentage = savedAmount ? (savedTax / savedAmount) * 100 : 0

  // O imposto salvo "bate" com a margem cadastrada se a diferença é menor que 1 centavo
  const savedTaxIsRegistered =
    registeredTax != null && Math.abs(savedTax - (savedAmount * registeredTax) / 100) < 0.01

  // Modo padrão: ao criar, usa a margem cadastrada se existir; ao editar, só se o imposto salvo bater com ela.
  // Enquanto o usuário não mexe nos checkboxes (chosenTaxMode vazio), vale o padrão.
  const [chosenTaxMode, setChosenTaxMode] = useState<TaxMode>()
  const [manualTaxInput, setManualTaxInput] = useState("")

  const hasRegisteredTaxByDefault = isEditing ? savedTaxIsRegistered : registeredTax != null
  const defaultTaxMode: TaxMode = hasRegisteredTaxByDefault ? "registered" : "none"
  const taxMode = chosenTaxMode ?? defaultTaxMode

  // Percentual aplicado em cada modo. Sem escolha: mantém o salvo ao editar e zero ao criar.
  const taxPercentage = {
    registered: registeredTax ?? 0,
    manual: Math.max(Number(manualTaxInput) || 0, 0),
    none: isEditing ? savedTaxPercentage : 0,
  }[taxMode]

  // A API trata a ausência da margem, então nunca enviamos valores menores que 1
  const taxPercentageToSubmit = taxPercentage >= 1 ? taxPercentage : undefined

  function changeTaxMode(mode: TaxMode) {
    if (mode === "registered") setManualTaxInput("") // descarta o valor digitado ao voltar para a margem cadastrada
    setChosenTaxMode(mode)
  }

  // ── Formulário, notas e gastos (estado e envio ficam no hook) ──
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
    handleSubmit,
    handleCancel,
    resetToOriginal,
    isPending,
    isLoading,
    hasChanges,
    toCurrencyValue,
  } = useMonthlyClosing({
    year,
    id,
    onClose: () => navigate("/dashboard"),
    taxPercentageToSubmit,
    hasTaxPercentageChanges: chosenTaxMode !== undefined,
  })

  // "Voltar" sai da tela (handleCancel); "Cancelar" só desfaz as alterações (handleReset):
  // ao editar volta ao que veio da API, ao criar zera tudo
  function handleReset() {
    resetToOriginal()
    setChosenTaxMode(undefined)
    setManualTaxInput("")
  }

  // ── Totais do resumo ──
  const [accountFeeField, individualContributionField] = useWatch({
    control,
    name: ["accountFee", "individualContribution"],
  })

  const totalInvoiceTaxValue = amountCollectedValue * (taxPercentage / 100)
  const taxPercentageLabel = taxPercentage.toLocaleString("pt-BR", { maximumFractionDigits: 2 })

  // Custo operacional PJ = contabilidade + contribuição individual + imposto das notas
  const operationalTotal =
    convertCurrencyToNumber(accountFeeField) +
    convertCurrencyToNumber(individualContributionField) +
    totalInvoiceTaxValue

  const expensesTotal = expenses.reduce(
    (total, expense) => total + convertCurrencyToNumber(expense.value),
    0,
  )

  const remaining = amountCollectedValue - (operationalTotal + expensesTotal)

  // Ao editar, só permite salvar se algo mudou
  const isSubmitDisabled = isPending || (isEditing && !hasChanges)

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

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start"
        >
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

              <div className="flex flex-col">
                <div className="flex flex-col gap-1.5 sm:w-1/2 mb-2">
                  <span className="text-sm font-medium text-ink-soft">Imposto sobre a nota</span>
                  <Input
                    value={`${toCurrencyValue(totalInvoiceTaxValue)} (${taxPercentageLabel}%)`}
                    disabled
                    readOnly
                  />
                </div>
                <div className="flex flex-col sm:w-1/2">
                  {registeredTax !== null ? (
                    <label className="flex min-h-9 cursor-pointer items-center gap-2 text-sm text-ink-soft">
                      <input
                        type="checkbox"
                        checked={taxMode === "registered"}
                        onChange={(event) =>
                          changeTaxMode(event.target.checked ? "registered" : "none")
                        }
                        className="h-4 w-4 accent-brand"
                      />
                      Aplicar margem cadastrada ({registeredTax}%)
                    </label>
                  ) : (
                    <button
                      type="button"
                      className="flex min-h-9 w-fit items-center text-left text-sm font-medium text-brand underline underline-offset-4 transition-colors hover:text-brand-strong"
                    >
                      Cadastrar margem de imposto
                    </button>
                  )}

                  <label className="flex min-h-9 cursor-pointer items-center gap-2 text-sm text-ink-soft mb-2">
                    <input
                      type="checkbox"
                      checked={taxMode === "manual"}
                      onChange={(event) => changeTaxMode(event.target.checked ? "manual" : "none")}
                      className="h-4 w-4 accent-brand"
                    />
                    Informar margem manualmente
                  </label>

                  {taxMode === "manual" && (
                    <div className="flex items-center gap-2">
                      <label htmlFor="manual-tax-percentage" className="sr-only">
                        Porcentagem manual do imposto
                      </label>
                      <Input
                        id="manual-tax-percentage"
                        type="number"
                        min="0"
                        step="0.01"
                        value={manualTaxInput}
                        onChange={(event) => setManualTaxInput(event.target.value)}
                        placeholder="0"
                        className="w-28"
                      />
                      <span className="text-sm text-ink-soft">%</span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-4 pt-6 border-t border-line">
              <div>
                <h2 className="text-base font-semibold text-ink">Gastos pessoais</h2>
                <p className="text-xs text-ink-faint mt-0.5">
                  Registre as despesas pessoais cobertas com esse fechamento.
                </p>
              </div>
              <PersonalExpensesInput addType={addExpense} />
              <ExpensesTable expenses={expenses} onRemove={removeExpense} />
            </section>

            <div className="flex justify-end gap-3 pt-2 lg:hidden">
              <button
                type="button"
                onClick={handleReset}
                className="h-10 px-4 rounded-control border border-line text-sm font-medium text-ink-soft hover:border-line-strong transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitDisabled}
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
                <span className="text-sm font-semibold tabular-nums">
                  {formatCurrencyBRL(operationalTotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Despesas pessoais</span>
                <span className="text-sm font-semibold tabular-nums">
                  {formatCurrencyBRL(expensesTotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Saldo restante</span>
                <span
                  className={`text-sm font-semibold tabular-nums ${remaining < 0 ? "text-expense" : "text-income"}`}
                >
                  {formatCurrencyBRL(remaining)}
                </span>
              </div>
            </div>

            <div className="hidden lg:flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleReset}
                className="h-10 px-4 rounded-control border border-white/15 text-sm font-medium text-white/80 hover:border-white/30 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="h-10 px-5 rounded-control bg-brand text-white text-sm font-medium hover:bg-brand-strong disabled:opacity-50 transition-colors"
              >
                {isPending ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  )
}
