import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useLogin, type LoginRequest } from "../../services/auth/login"
import { useSession } from "../../stores/session"
import { BalanceBar } from "../../components/balanceBar/BalanceBar"
import { getErrorMessage } from "../../utils/getErrorMessage"
import { Eye, EyeOff } from "lucide-react"
import { Oval } from "react-loader-spinner"
import { useForgotPassword } from "../../services/auth/forgotPassword"

type LoginFormData = LoginRequest

export const Login = () => {
  const { createSession, session, destroySession } = useSession()
  const navigate = useNavigate()
  const [loginError, setLoginError] = useState<string | null>(null)
  const [forgotPasswordError, setForgotPassowordError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const { mutate: login, isPending } = useLogin()
  const { mutate: sendForgotPassword, isPending: isPendingForgotPassword } = useForgotPassword()

  const onSubmit = (data: LoginFormData) => {
    setLoginError(null)
    login(data, {
      onSuccess: (response) => {
        createSession({ access_token: response.access_token }, response.user)
        navigate("/dashboard")
      },
      onError: (error) => {
        setLoginError(getErrorMessage(error, "Email ou senha inválidos"))
        destroySession()
      },
    })
  }

  const forgPassword = async () => {
    const email = await getValues("email")
    const isEmailValid = await trigger("email")

    if (!isEmailValid) return

    setForgotPassowordError(null)
    sendForgotPassword(
      {
        email: email,
      },
      {
        onSuccess: () => {
          navigate("/resend-forgot-password", { state: { email: email } })
        },
        onError: (error) =>
          setForgotPassowordError(
            getErrorMessage(error, "Não foi enviar o email para redefinição de senha."),
          ),
      },
    )
  }

  useEffect(() => {
    if (session?.access_token) {
      navigate("/dashboard", { replace: true })
    }
  }, [session, navigate])

  return (
    <div className="min-h-screen flex bg-canvas">
      {/* Painel de marca — só em telas maiores */}
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

      {/* Painel de formulário */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-9 h-9 rounded-control bg-brand text-white flex items-center justify-center font-bold text-sm">
              FD
            </div>
            <span className="font-semibold text-ink">Finance Developer</span>
          </div>

          <h2 className="text-2xl font-semibold text-ink tracking-tight">Bem-vindo de volta</h2>
          <p className="mt-2 text-sm text-ink-faint">
            Entre com suas credenciais para acessar seu fechamento.
          </p>

          {loginError && (
            <div className="mt-4 p-3.5 rounded-control bg-expense-soft border border-expense text-expense text-sm font-medium">
              {loginError}
            </div>
          )}

          {forgotPasswordError && (
            <div className="mt-4 p-3.5 rounded-control bg-expense-soft border border-expense text-expense text-sm font-medium">
              {forgotPasswordError}
            </div>
          )}

          <form className="mt-8 flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-ink-soft">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email", {
                  required: "Email é obrigatório",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email inválido",
                  },
                })}
                placeholder="voce@empresa.com"
                className={`h-11 rounded-control border px-3.5 text-sm text-ink bg-surface outline-none transition-colors focus:ring-2 focus:ring-brand/30 ${
                  errors.email ? "border-expense" : "border-line focus:border-brand"
                }`}
              />
              {errors.email && <p className="text-xs text-expense">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-ink-soft">
                  Senha
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-brand transition-colors hover:text-brand-strong cursor-pointer"
                  onClick={() => forgPassword()}
                >
                  Esqueci a senha
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="off"
                  placeholder="Senha"
                  {...register("password", {
                    required: "Senha é obrigatória",
                    minLength: {
                      value: 6,
                      message: "Senha deve ter no mínimo 6 caracteres",
                    },
                  })}
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

            <button
              type="submit"
              disabled={isPending || isPendingForgotPassword}
              className="mt-2 h-11 rounded-control bg-brand text-white text-sm font-medium transition-colors hover:bg-brand-strong disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isPending || isPendingForgotPassword ? (
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
                "Entrar"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-faint">
            Não tem uma conta?{" "}
            <Link
              to="/signup"
              className="font-medium text-brand transition-colors hover:text-brand-strong"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
