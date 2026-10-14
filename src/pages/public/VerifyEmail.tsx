import { useEffect, useState } from "react"
import { Link, Navigate, useLocation } from "react-router-dom"
import { MailCheck } from "lucide-react"
import { BalanceBar } from "../../components/balanceBar"
import { useResendEmailConfirmation } from "../../services/auth/resendEmailConfirmation"
import toast from "react-hot-toast"
import { getErrorMessage } from "../../utils/getErrorMessage"
import { Oval } from "react-loader-spinner"

const RESEND_COOLDOWN_SECONDS = 5

type VerifyEmailState = { email?: string } | null

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export const VerifyEmail = () => {
  const { mutate: resend, isPending } = useResendEmailConfirmation()

  const location = useLocation()
  const email = (location.state as VerifyEmailState)?.email

  console.log(email)
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS)

  useEffect(() => {
    if (secondsLeft <= 0) return

    const timeout = setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000)
    return () => clearTimeout(timeout)
  }, [secondsLeft])

  const canResend = secondsLeft === 0

  const resendEmail = () => {
    console.log("============> ", email)
    resend(
      {
        email: email!,
      },
      {
        onSuccess: () => {
          toast.success("Email reenviado!")
        },
        onError: (error) => {
          toast.error(
            getErrorMessage(
              error,
              "Não foi possivel reenviar o email, tente novamente mais tarde.",
            ),
          )
        },
      },
    )
    setSecondsLeft(RESEND_COOLDOWN_SECONDS)
  }

  // acesso direto à rota sem passar pelo cadastro
  if (!email) return <Navigate to="/signup" replace />

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

          <div className="w-12 h-12 rounded-full bg-brand-soft text-brand flex items-center justify-center">
            <MailCheck size={24} strokeWidth={1.8} />
          </div>

          <h2 className="mt-6 text-2xl font-semibold text-ink tracking-tight">
            Verifique seu e-mail
          </h2>
          <p className="mt-2 text-sm text-ink-faint">Enviamos um link de confirmação para</p>
          <p className="mt-1 text-sm font-medium text-ink break-all">{email}</p>
          <p className="mt-4 text-sm text-ink-faint">
            Abra a mensagem e clique no link para ativar sua conta. Não encontrou? Confira também a
            caixa de spam ou lixo eletrônico.
          </p>

          <button
            type="button"
            disabled={!canResend}
            className="mt-8 h-11 w-full rounded-control bg-brand text-white text-sm font-medium transition-colors hover:bg-brand-strong disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            onClick={() => resendEmail()}
          >
            {isPending ? (
              <Oval
                visible={true}
                height="22"
                width="22"
                color="#FFF"
                secondaryColor="rgba(255, 255, 255, 0.25)"
                ariaLabel="oval-loading"
                wrapperStyle={{}}
                wrapperClass=""
              />
            ) : canResend ? (
              "Reenviar e-mail"
            ) : (
              `Reenviar e-mail em ${formatTime(secondsLeft)}`
            )}
          </button>

          <p className="mt-6 text-center text-sm text-ink-faint">
            <Link
              to="/login"
              className="font-medium text-brand transition-colors hover:text-brand-strong"
            >
              Voltar para o login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
