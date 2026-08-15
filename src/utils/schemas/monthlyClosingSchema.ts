import * as yup from "yup";

export const monthlyClosingSchema = yup.object({
  closingDate: yup.string().required("Informe o mês de fechamento."),
  amountCollected: yup.string().required("Informe o valor arrecadado."),
  accountFee: yup.string().required("Informe a taxa de contabilidade."),
  individualContribution: yup
    .string()
    .required("Informe a contribuição individual."),
  totalInvoiceTax: yup.string().required("Informe o imposto sobre a nota."),
});
