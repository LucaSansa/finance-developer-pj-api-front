export function currencyMask(value: string) {
  const onlyNumbers = value.replace(/\D/g, "");
  const number = Number(onlyNumbers) / 100;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(number);
}
