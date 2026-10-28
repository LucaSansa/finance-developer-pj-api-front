import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import type * as yup from "yup"
import { Layout } from "../../components/layout/Layout"
import { Input } from "../../components/input/Input"
import {
  useChangeEmailRequest,
  useChangePasswordRequest,
  useGetMe,
  useUpdateUser,
} from "../../services/user"
import type { ChangePasswordRequest, UpdateUser } from "../../services/user"
import { userInfo, emailChange, changePassword } from "../../utils/schemas/profileSchema"
import { maskCnpj } from "../../utils/maskCnpj"
import toast from "react-hot-toast"
import { Oval } from "react-loader-spinner"
import { useLocation, useNavigate } from "react-router-dom"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"

export function Profile() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { data: me } = useGetMe()
  const { mutate: updateUser, isPending } = useUpdateUser()
  const { mutate: changeEmailRequest, isPending: isPendingChangeEmailRequest } =
    useChangeEmailRequest()
  const { mutate: changePasswordRequest, isPending: isPendingChangePassword } =
    useChangePasswordRequest()

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassaword, setShowNewPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields, isDirty },
  } = useForm({
    resolver: yupResolver(userInfo),
    defaultValues: {
      name: "",
      cnpj: "",
      taxPercentage: "",
    },
  })

  const {
    register: registerChangeEmailForm,
    handleSubmit: handleSubmitChangeEmailForm,
    reset: resetChangeEmailForm,
    formState: {
      errors: changeEmailErrors,
      dirtyFields: changeEmailDirtyFields,
      isDirty: changeEmailDirty,
    },
  } = useForm({
    resolver: yupResolver(emailChange),
    defaultValues: {
      email: "",
    },
  })

  const cnpjField = register("cnpj")

  const {
    register: registerChangePassoword,
    handleSubmit: handleSubmitChangePassword,
    reset: resetChangePassword,
    formState: {
      errors: changePasswordErrors,
      dirtyFields: changePasswordDirtyFields,
      isDirty: changePasswordDirty,
    },
  } = useForm({
    resolver: yupResolver(changePassword),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      passwordConfirmation: "",
    },
  })

  // preenche o formulário quando os dados do usuário chegam
  useEffect(() => {
    if (!me) return

    reset({
      name: me.name ?? "",
      cnpj: me.cnpj ? maskCnpj(me.cnpj) : "",
      taxPercentage: me.taxPercentage != null ? String(me.taxPercentage) : "",
    })

    resetChangeEmailForm({
      email: me.email ?? "",
    })

    resetChangePassword({
      currentPassword: "",
      newPassword: "",
      passwordConfirmation: "",
    })
  }, [me, reset, resetChangeEmailForm, resetChangePassword])

  const onSubmit = (data: yup.InferType<typeof userInfo>) => {
    // PATCH: apenas os campos alterados
    const changedFields: UpdateUser = {}

    if (dirtyFields.name) changedFields.name = data.name
    if (dirtyFields.cnpj) changedFields.cnpj = data.cnpj
    if (dirtyFields.taxPercentage && data.taxPercentage !== "") {
      changedFields.taxPercentage = Number(data.taxPercentage)
    }

    updateUser(changedFields, {
      onSuccess: () => {
        toast.success("Dados atualizados com sucesso!")
      },
    })
  }

  const onSubmitChangeEmail = (data: yup.InferType<typeof emailChange>) => {
    const changedField: { email: string } = { email: "" }

    if (changeEmailDirtyFields.email) changedField.email = data.email

    changeEmailRequest(changedField, {
      onSuccess: () => {
        toast.success("Confira o e-mail enviado no novo endereço")
      },
    })
  }

  const onSubmitChangePassword = (data: yup.InferType<typeof changePassword>) => {
    const changeFields: ChangePasswordRequest = { currentPassword: "", newPassword: "" }

    if (changePasswordDirtyFields.currentPassword)
      changeFields.currentPassword = data.currentPassword

    if (changePasswordDirtyFields.newPassword) changeFields.newPassword = data.newPassword

    changePasswordRequest(changeFields, {
      onSuccess: () => {
        toast.success("Senha alterada com sucesso!")
      },
    })
  }

  return (
    <Layout>
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Voltar"
        className="mb-6 inline-flex w-fit items-center text-black transition-opacity hover:opacity-70 cursor-pointer"
      >
        <ArrowLeft size={24} aria-hidden="true" />
      </button>

      <div className="flex flex-col md:flex-row align-baseline md:gap-x-6">
        <div className="w-full flex flex-col">
          <div className="flex flex-col gap-1 mb-8">
            <h1 className="text-2xl font-semibold text-ink tracking-tight">Meu perfil</h1>
          </div>

          <form className="flex flex-col gap-5 mb-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-5 w-full md:max-w-md">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-sm font-medium text-ink-soft">
                  Nome
                </label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="off"
                  placeholder="Nome Completo"
                  {...register("name")}
                  error={errors.name?.message}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="cnpj" className="text-sm font-medium text-ink-soft">
                  Cnpj
                </label>
                <Input
                  id="cnpj"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={18}
                  placeholder="00.000.000/0000-00"
                  {...cnpjField}
                  onChange={(e) => {
                    e.target.value = maskCnpj(e.target.value)
                    cnpjField.onChange(e)
                  }}
                  error={errors.cnpj?.message}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="taxPercentage" className="text-sm font-medium text-ink-soft">
                  Margem de imposto (%)
                </label>
                <div className="flex items-start gap-2">
                  <Input
                    id="taxPercentage"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="w-28"
                    autoFocus={state?.focus === "taxPercentage"}
                    {...register("taxPercentage")}
                    error={errors.taxPercentage?.message}
                  />
                  <span className="h-11 flex items-center text-sm text-ink-soft">%</span>
                </div>
              </div>
            </div>

            <button
              disabled={!isDirty}
              type="submit"
              className="mt-2 h-11 rounded-control bg-brand text-white text-sm font-medium transition-colors hover:bg-brand-strong w-full md:max-w-md flex justify-center items-center"
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
                "Salvar"
              )}
            </button>
          </form>

          <div className="flex flex-col gap-1 mb-8">
            <h1 className="text-2xl font-semibold text-ink tracking-tight">Email</h1>
          </div>

          <form
            className="flex flex-col gap-5 mb-8"
            onSubmit={handleSubmitChangeEmailForm(onSubmitChangeEmail)}
          >
            <div className="flex flex-col gap-1.5 w-full md:max-w-md">
              <label htmlFor="name" className="text-sm font-medium text-ink-soft">
                Email
              </label>
              <input
                id="email"
                type="text"
                autoComplete="off"
                placeholder="E-mail"
                {...registerChangeEmailForm("email")}
                className={`h-11 rounded-control border px-3.5 text-sm text-ink bg-surface outline-none transition-colors focus:ring-2 focus:ring-brand/30 ${
                  changeEmailErrors.email ? "border-expense" : "border-line focus:border-brand"
                }`}
              />
              {changeEmailErrors.email && (
                <p className="text-xs text-expense">{changeEmailErrors.email.message}</p>
              )}
            </div>

            <button
              disabled={!changeEmailDirty}
              type="submit"
              className="mt-2 h-11 rounded-control bg-brand text-white text-sm font-medium transition-colors hover:bg-brand-strong w-full md:max-w-md flex justify-center items-center"
            >
              {isPendingChangeEmailRequest ? (
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
                "Enviar"
              )}
            </button>
          </form>
        </div>

        <div className="w-full flex flex-col">
          <div className="flex flex-col gap-1 mb-8">
            <h1 className="text-2xl font-semibold text-ink tracking-tight">Email</h1>
          </div>

          <form
            className="flex flex-col gap-5 mb-8"
            onSubmit={handleSubmitChangePassword(onSubmitChangePassword)}
          >
            <div className="flex flex-col gap-5 w-full md:max-w-md">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-ink-soft">
                  Senha Atual
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    autoComplete="off"
                    placeholder="Senha"
                    {...registerChangePassoword("currentPassword")}
                    className={`h-11 w-full rounded-control border pl-3.5 pr-10 text-sm text-ink bg-surface outline-none transition-colors focus:ring-2 focus:ring-brand/30 ${
                      changePasswordErrors.currentPassword
                        ? "border-expense"
                        : "border-line focus:border-brand"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    aria-label={showCurrentPassword ? "Ocultar senha" : "Mostrar senha"}
                    aria-pressed={showCurrentPassword}
                    className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-ink-soft hover:text-ink transition-colors"
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} strokeWidth={1.8} />
                    ) : (
                      <Eye size={18} strokeWidth={1.8} />
                    )}
                  </button>
                </div>
                {changePasswordErrors.currentPassword && (
                  <p className="text-xs text-expense">
                    {changePasswordErrors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-ink-soft">
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassaword ? "text" : "password"}
                    autoComplete="off"
                    placeholder="Senha"
                    {...registerChangePassoword("newPassword")}
                    className={`h-11 w-full rounded-control border pl-3.5 pr-10 text-sm text-ink bg-surface outline-none transition-colors focus:ring-2 focus:ring-brand/30 ${
                      changePasswordErrors.newPassword
                        ? "border-expense"
                        : "border-line focus:border-brand"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    aria-label={showNewPassaword ? "Ocultar senha" : "Mostrar senha"}
                    aria-pressed={showNewPassaword}
                    className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-ink-soft hover:text-ink transition-colors"
                  >
                    {showNewPassaword ? (
                      <EyeOff size={18} strokeWidth={1.8} />
                    ) : (
                      <Eye size={18} strokeWidth={1.8} />
                    )}
                  </button>
                </div>
                {changePasswordErrors.newPassword && (
                  <p className="text-xs text-expense">{changePasswordErrors.newPassword.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="passwordConfirmation" className="text-sm font-medium text-ink-soft">
                  Confirmação de senha
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPasswordConfirmation ? "text" : "password"}
                    autoComplete="off"
                    placeholder="Confirmação de senha"
                    {...registerChangePassoword("passwordConfirmation")}
                    className={`h-11 w-full rounded-control border pl-3.5 pr-10 text-sm text-ink bg-surface outline-none transition-colors focus:ring-2 focus:ring-brand/30 ${
                      changePasswordErrors.passwordConfirmation
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
                {changePasswordErrors.passwordConfirmation && (
                  <p className="text-xs text-expense">
                    {changePasswordErrors.passwordConfirmation.message}
                  </p>
                )}
              </div>

              <button
                disabled={!changePasswordDirty}
                type="submit"
                className="mt-2 h-11 rounded-control bg-brand text-white text-sm font-medium transition-colors hover:bg-brand-strong w-full md:max-w-md flex justify-center items-center"
              >
                {isPendingChangePassword ? (
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
                  "Enviar"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
