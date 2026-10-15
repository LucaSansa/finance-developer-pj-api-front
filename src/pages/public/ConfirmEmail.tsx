import { useEffect, useRef } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { CircleCheck, CircleX } from "lucide-react"
import { BalanceBar } from "../../components/balanceBar/BalanceBar"
import { Oval } from "react-loader-spinner"
import { useConfirmEmail } from "../../services/auth/confirmEmail"
import { getErrorMessage } from "../../utils/getErrorMessage"

export const ConfirmEmail = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  const { mutate: confirmEmail, isPending, isSuccess, isError, error } = useConfirmEmail()

  // O token é de uso único: evita a segunda chamada do React StrictMode em dev
  const hasRequested = useRef(false)

  useEffect(() => {
    if (!token || hasRequested.current) return
    hasRequested.current = true
    confirmEmail({ token })
  }, [token, confirmEmail])

  const isInvalid = !token || isError
  const isLoading = !isInvalid && !isSuccess

  return (
    <div className="min-h-screen flex bg-canvas">
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-ink relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,192,0.35),transparent_55%)]" />

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-control bg-brand text-white flex items-center justify-center font-bold text-sm">
            FD
          </div>
          <span className="text-white font-semibold">Finance Developer</span>
        </div>

        <div className="relative flex flex-col gap-6 max-w-md">
          <h1 className="text-4xl font-semibold text-white leading-tight tracking-tight">
            Seu fechamento mensal, sempre no controle.
          </h1>
          <p className="text-white/60 text-base">
            Notas fiscais, custo operacional e despesas pessoais organizados mês a mês, ano a ano.
          </p>

          <div className="rounded-panel bg-white/6 border border-white/10 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-white/70">Setembro 2026</span>
              <span className="text-xs font-medium text-income bg-income-soft px-2 py-0.5 rounded-full">
                Aberto
              </span>
            </div>
            <p className="text-2xl font-semibold text-white mb-4 tabular-nums">R$ 20.000,50</p>
            <BalanceBar
              collected={20000.5}
              segments={[
                {
                  key: "operacional",
                  label: "Operacional",
                  value: 3250.03,
                  trackClass: "bg-tax",
                  dotClass: "bg-tax",
                },
                {
                  key: "despesas",
                  label: "Despesas",
                  value: 1200.5,
                  trackClass: "bg-expense",
                  dotClass: "bg-expense",
                },
              ]}
              size="sm"
            />
          </div>
        </div>

        <p className="relative text-xs text-white/40">
          &copy; {new Date().getFullYear()} LPM Systems
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-9 h-9 rounded-control bg-brand text-white flex items-center justify-center font-bold text-sm">
              FD
            </div>
            <span className="font-semibold text-ink">Finance Developer</span>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center text-center">
              <Oval
                visible={true}
                height="40"
                width="40"
                color="#4F46C0"
                secondaryColor="rgba(79, 70, 192, 0.25)"
                ariaLabel="oval-loading"
              />
              <h2 className="mt-6 text-2xl font-semibold text-ink tracking-tight">
                {isPending ? "Verificando sua conta..." : "Aguarde..."}
              </h2>
            </div>
          )}

          {isSuccess && (
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-income-soft text-income flex items-center justify-center">
                <CircleCheck size={24} strokeWidth={1.8} />
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-ink tracking-tight">
                Conta verificada!
              </h2>
              <p className="mt-2 text-sm text-ink-faint">
                Seu e-mail foi confirmado com sucesso. Agora você já pode acessar sua conta.
              </p>
              <Link
                to="/login"
                className="mt-8 h-11 w-full rounded-control bg-brand text-white text-sm font-medium transition-colors hover:bg-brand-strong flex justify-center items-center"
              >
                Ir para o login
              </Link>
            </div>
          )}

          {isInvalid && (
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-expense-soft text-expense flex items-center justify-center">
                <CircleX size={24} strokeWidth={1.8} />
              </div>
              <h2 className="mt-6 text-2xl font-semibold text-ink tracking-tight">
                Link inválido ou expirado
              </h2>
              <p className="mt-2 text-sm text-ink-faint">
                {token
                  ? getErrorMessage(error, "Não foi possível verificar sua conta.")
                  : "O link de confirmação não possui um token válido."}
              </p>
              <Link
                to="/signup"
                className="mt-8 h-11 w-full rounded-control bg-brand text-white text-sm font-medium transition-colors hover:bg-brand-strong flex justify-center items-center"
              >
                Criar conta novamente
              </Link>
              <Link
                to="/login"
                className="mt-6 text-sm font-medium text-brand transition-colors hover:text-brand-strong"
              >
                Voltar para o login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
