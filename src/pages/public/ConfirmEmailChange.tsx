import { CircleCheck, CircleX } from "lucide-react"
import { Oval } from "react-loader-spinner"
import { Link, useSearchParams } from "react-router-dom"
import { AuthBrandPanel } from "../../components/authBrandPanel/AuthBrandPanel"
import { getErrorMessage } from "../../utils/getErrorMessage"
import { useConfirmEmailChange } from "../../services/auth/confirmEmailChange"
import { useEffect, useRef } from "react"

export const ConfirmEmailChange = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  const {
    mutate: confirmEmailChange,
    isPending,
    isSuccess,
    isError,
    error,
  } = useConfirmEmailChange()

  const hasRequested = useRef(false)

  useEffect(() => {
    if (!token || hasRequested.current) return
    hasRequested.current = true
    confirmEmailChange({ token })
  }, [token, confirmEmailChange])

  const isInvalid = !token || isError
  const isLoading = !isInvalid && !isSuccess

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
                O E-mail foi substituido!
              </h2>
              <p className="mt-2 text-sm text-ink-faint">
                Da proxima vez que logar, já pode utilizar o novo e-mail.
              </p>
              <Link
                to="/signin"
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
                to="/signin"
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
