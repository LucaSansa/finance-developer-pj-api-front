import * as yup from "yup"
import { isValidCnpj } from "../isValidCnpj"

export const userInfo = yup.object({
  name: yup
    .string()
    .required("Informe o nome completo")
    .test("full-name", "Informe seu nome e sobrenome", (value) => {
      if (!value) return false

      return value.trim().split(/\s+/).length >= 2
    }),
  cnpj: yup
    .string()
    .defined()
    .test("cnpj-valid", "CNPJ inválido", (value) => !value || isValidCnpj(value)),
  taxPercentage: yup
    .string()
    .defined()
    .test("tax-valid", "Informe um percentual entre 0 e 100", (value) => {
      if (!value) return true

      const number = Number(value)

      return !Number.isNaN(number) && number >= 0 && number <= 100
    }),
})

export const emailChange = yup.object({
  email: yup.string().email("Digite um e-mail válido").required("O e-mail é obrigatório"),
})

export const changePassword = yup.object({
  currentPassword: yup
    .string()
    .required("Informe uma senha")
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .max(12, "A senha deve ter no máximo 12 caracteres")
    .matches(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
    .matches(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
    .matches(/[0-9]/, "A senha deve conter pelo menos um número")
    .matches(/[^A-Za-z0-9]/, "A senha deve conter pelo menos um símbolo"),
  newPassword: yup
    .string()
    .required("Informe uma senha")
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .max(12, "A senha deve ter no máximo 12 caracteres")
    .matches(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
    .matches(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
    .matches(/[0-9]/, "A senha deve conter pelo menos um número")
    .matches(/[^A-Za-z0-9]/, "A senha deve conter pelo menos um símbolo")
    .notOneOf([yup.ref("currentPassword")], "A nova senha deve ser diferente da senha atual"),
  passwordConfirmation: yup
    .string()
    .required("Confirme sua senha")
    .oneOf([yup.ref("newPassword")], "As senhas não coincidem"),
})
