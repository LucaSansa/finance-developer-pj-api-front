export const isValidCnpj = (value: string) => {
  const cnpj = value.replace(/\D/g, "")

  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false

  const calcDigit = (base: string) => {
    const weights =
      base.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const sum = base.split("").reduce((acc, d, i) => acc + Number(d) * weights[i], 0)
    const rest = sum % 11
    return rest < 2 ? 0 : 11 - rest
  }

  const d1 = calcDigit(cnpj.slice(0, 12))
  const d2 = calcDigit(cnpj.slice(0, 12) + d1)

  return cnpj.endsWith(`${d1}${d2}`)
}
