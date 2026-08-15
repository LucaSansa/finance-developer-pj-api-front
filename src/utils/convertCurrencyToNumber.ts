export function convertCurrencyToNumber(value: string | undefined): number {
  if (!value) return 0;
  const onlyNumbers = String(value).replace(/\D/g, "");
  return Number(onlyNumbers) / 100;
}
