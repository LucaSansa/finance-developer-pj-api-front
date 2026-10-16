import { Link, Navigate, useLocation } from "react-router-dom"
import { useForgotPassword } from "../../services/auth/forgotPassword"
import { useEffect, useState } from "react"
import { Oval } from "react-loader-spinner"
import { MailCheck } from "lucide-react"
import { AuthBrandPanel } from "../../components/authBrandPanel/AuthBrandPanel"
import toast from "react-hot-toast"
import { getErrorMessage } from "../../utils/getErrorMessage"

const RESEND_COOLDOWN_SECONDS = 60
type ForgotPasswordState = { email?: string } | null

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export const ForgotPassword = () => {
  const { mutate: sendForgotPassword, isPending } = useForgotPassword()

  const location = useLocation()
  const email = (location.state as ForgotPasswordState)?.email

  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS)

  useEffect(() => {
    if (secondsLeft <= 0) return

    const timeout = setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000)
    return () => clearTimeout(timeout)
  }, [secondsLeft])

  const canResend = secondsLeft === 0

  const resendEmailForgotPassword = () => {
    sendForgotPassword(
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

  if (!email) return <Navigate to="/signin" replace />

  return (
    <div className="min-h-screen flex bg-canvas">
      <AuthBrandPanel />

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
          <p className="mt-2 text-sm text-ink-faint">
            Enviamos o link de redefinição de senha para
          </p>
          <p className="mt-1 text-sm font-medium text-ink break-all">{email}</p>
          <p className="mt-4 text-sm text-ink-faint">
            Abra a mensagem e clique no link para redefinir a senha. Não encontrou? Confira também a
            caixa de spam ou lixo eletrônico.
          </p>

          <button
            type="button"
            disabled={!canResend}
            className="mt-8 h-11 w-full rounded-control bg-brand text-white text-sm font-medium transition-colors hover:bg-brand-strong disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            onClick={() => resendEmailForgotPassword()}
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
              to="/signin"
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
