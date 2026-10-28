---
name: simple-use-form
description: "Use ao criar ou implementar um formulário: monta useForm (react-hook-form) com yupResolver, schema yup em src/utils/schemas, inputs com erro e máscara, deixando o formulário funcional com validação (sem implementar o envio), seguindo o padrão simples de src/pages/public/Signup.tsx."
argument-hint: "campos do formulário e o que fazer ao enviar"
---

# Simple use form

Estrutura formulários fáceis de ler e manter, no padrão de `src/pages/public/Signup.tsx` (parte do `useForm` e dos campos) e `src/utils/schemas/signupSchema.ts`. Leia os dois antes de começar. A skill só monta o formulário e a validação; **não implementa o envio** (mutation, chamadas de API, tratamento de erro da API, navegação), que o usuário faz depois. Use só os campos e regras pedidos; não invente campos nem serviços.

## Estrutura
1. **Schema yup** em `src/utils/schemas/<nome>Schema.ts`, export nomeado `<nome>Schema`, uma regra por linha, mensagens em português.
2. **Formulário** na página/componente, com `useForm` + `yupResolver(schema)` e `defaultValues` para todos os campos.
3. **onSubmit** apenas declarado, tipado com `yup.InferType<typeof schema>`, sem lógica de envio.
4. Utilitários existentes (máscaras, validadores) ficam em `src/utils`; reutilize antes de criar.

## 1. Schema (um campo = uma chave, regras encadeadas)
```ts
import * as yup from "yup"
import { isValidCnpj } from "../isValidCnpj"

export const signupSchema = yup.object({
  name: yup
    .string()
    .required("Informe o nome completo")
    .test("full-name", "Informe seu nome e sobrenome", (value) => {
      if (!value) return false
      return value.trim().split(/\s+/).length >= 2
    }),
  cnpj: yup
    .string()
    .required("Informe o CNPJ")
    .test("cnpj-valid", "CNPJ inválido", (value) => isValidCnpj(value ?? "")),
  email: yup.string().email("Digite um e-mail válido").required("O e-mail é obrigatório"),
  password: yup
    .string()
    .required("Informe uma senha")
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .matches(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula"),
  passwordConfirmation: yup
    .string()
    .required("Confirme sua senha")
    .oneOf([yup.ref("password")], "As senhas não coincidem"),
})
```
Regras: `required` primeiro, depois o formato; validação customizada com `.test(nome, mensagem, fn)`; confirmação com `oneOf([yup.ref("campo")])`. Se a regra já existe em outro schema (ex.: senha em `resetPasswordSchema.ts`), siga o mesmo texto.

## 2. useForm
```tsx
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({
  resolver: yupResolver(signupSchema),
  defaultValues: {
    name: "",
    cnpj: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  },
})
```
`defaultValues` com string vazia para cada campo do schema, na mesma ordem.

## 3. onSubmit (somente a estrutura)
```tsx
const onSubmit = (data: yup.InferType<typeof signupSchema>) => {
  // envio será implementado pelo usuário
}
```
O `handleSubmit(onSubmit)` só chama `onSubmit` com os dados já validados. Não adicione mutation, estado de erro da API, `isPending` nem navegação.

## 4. Campos no JSX
`<form onSubmit={handleSubmit(onSubmit)}>`, cada campo em `div` com `flex flex-col gap-1.5`: `label` com `htmlFor` igual ao `id`, `input` com `{...register("campo")}` e mensagem de erro abaixo.

```tsx
<div className="flex flex-col gap-1.5">
  <label htmlFor="email" className="text-sm font-medium text-ink-soft">Email</label>
  <input
    id="email"
    type="text"
    autoComplete="off"
    placeholder="E-mail"
    {...register("email")}
    className={`h-11 rounded-control border px-3.5 text-sm text-ink bg-surface outline-none transition-colors focus:ring-2 focus:ring-brand/30 ${
      errors.email ? "border-expense" : "border-line focus:border-brand"
    }`}
  />
  {errors.email && <p className="text-xs text-expense">{errors.email.message}</p>}
</div>
```
Para campos novos, prefira o componente `src/components/input/Input.tsx`, que já aplica o estilo e a mensagem: `<Input {...register("email")} error={errors.email?.message} />`.

### Campo com máscara
Guarde o retorno de `register` e sobrescreva `onChange`:
```tsx
const cnpjField = register("cnpj")

<input
  id="cnpj"
  inputMode="numeric"
  maxLength={18}
  {...cnpjField}
  onChange={(e) => {
    e.target.value = maskCnpj(e.target.value)
    cnpjField.onChange(e)
  }}
/>
```

### Campo de senha com mostrar/ocultar
Estado `useState(false)`, `type={show ? "text" : "password"}` e botão `type="button"` com `aria-label`, ícones `Eye`/`EyeOff` de `lucide-react`.

### Botão de envio
`type="submit"` simples, no estilo do botão do Signup, sem spinner.

## Checklist
- Schema separado em `src/utils/schemas`, sem regras na página.
- `defaultValues` completos e `onSubmit` tipado com `InferType`, sem lógica de envio.
- Todo campo tem `label`, `register`, estilo de erro e mensagem.
- Rode `npx tsc -b` e `npm run lint` e informe o resultado.
