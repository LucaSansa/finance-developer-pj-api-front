import { useForm } from "react-hook-form"
import { Oval } from "react-loader-spinner"
import { Link, useSearchParams } from "react-router-dom"
import { AuthBrandPanel } from "../../components/authBrandPanel/AuthBrandPanel"
import { useState } from "react"
import { yupResolver } from "@hookform/resolvers/yup"
import { resetPasswordSchema } from "../../utils/schemas/resetPasswordSchema"
import { Eye, EyeOff } from "lucide-react"
import { useResetPassword } from "../../services/auth/resetPassword"
import { getErrorMessage } from "../../utils/getErrorMessage"
import toast from "react-hot-toast"
import type * as yup from "yup"

export const ResetPassword = () => {
  const { mutate: resetPassword, isPending } = useResetPassword()

  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")

  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)

  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
  })

  const onSubmit = (data: yup.InferType<typeof resetPasswordSchema>) => {
    setResetPasswordError(null)
    resetPassword(
      {
        token: token!,
        password: data.password,
      },
      {
        onSuccess: (response) => {
          toast.success(response.message)
        },
        onError: (error) => {
          setResetPasswordError(
            getErrorMessage(error, "Não foi possivel resetar a senha, tente novamente mais tarde."),
          )
        },
      },
    )
  }

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

          <h2 className="text-2xl font-semibold text-ink tracking-tight">Reset de Senha</h2>
          <p className="mt-2 text-sm text-ink-faint">Defina uma nova senha para sua conta.</p>

          {resetPasswordError && (
            <div className="mt-4 p-3.5 rounded-control bg-expense-soft border border-expense text-expense text-sm font-medium">
              {resetPasswordError}
            </div>
          )}

          <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-ink-soft">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="off"
                  placeholder="Senha"
                  {...register("password")}
                  className={`h-11 w-full rounded-control border pl-3.5 pr-10 text-sm text-ink bg-surface outline-none transition-colors focus:ring-2 focus:ring-brand/30 ${
                    errors.password ? "border-expense" : "border-line focus:border-brand"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-ink-soft hover:text-ink transition-colors"
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={1.8} />
                  ) : (
                    <Eye size={18} strokeWidth={1.8} />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-xs text-expense">{errors.password.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="passwordConfirmation" className="text-sm font-medium text-ink-soft">
                Confirmação de senha
              </label>
              <div className="relative">
                <input
                  id="passwordConfirmation"
                  type={showPasswordConfirmation ? "text" : "password"}
                  autoComplete="off"
                  placeholder="Confirmação de senha"
                  {...register("passwordConfirmation")}
                  className={`h-11 w-full rounded-control border pl-3.5 pr-10 text-sm text-ink bg-surface outline-none transition-colors focus:ring-2 focus:ring-brand/30 ${
                    errors.passwordConfirmation
                      ? "border-expense"
                      : "border-line focus:border-brand"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirmation((prev) => !prev)}
                  aria-label={
                    showPasswordConfirmation
                      ? "Ocultar confirmação de senha"
                      : "Mostrar confirmação de senha"
                  }
                  aria-pressed={showPasswordConfirmation}
                  className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-ink-soft transition-colors hover:text-ink"
                >
                  {showPasswordConfirmation ? (
                    <EyeOff size={18} strokeWidth={1.8} />
                  ) : (
                    <Eye size={18} strokeWidth={1.8} />
                  )}
                </button>
              </div>
              {errors.passwordConfirmation && (
                <p className="text-xs text-expense">{errors.passwordConfirmation.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="mt-2 h-11 rounded-control bg-brand text-white text-sm font-medium transition-colors hover:bg-brand-strong disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
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
              ) : (
                "Redefinir"
              )}
            </button>
          </form>
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
