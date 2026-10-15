import * as yup from "yup"

export const resetPasswordSchema = yup.object({
  password: yup
    .string()
    .required("Informe uma senha")
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .max(12, "A senha deve ter no máximo 12 caracteres")
    .matches(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
    .matches(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
    .matches(/[0-9]/, "A senha deve conter pelo menos um número")
    .matches(/[^A-Za-z0-9]/, "A senha deve conter pelo menos um símbolo"),
  passwordConfirmation: yup
    .string()
    .required("Confirme sua senha")
    .oneOf([yup.ref("password")], "As senhas não coincidem"),
})
