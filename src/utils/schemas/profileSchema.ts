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
