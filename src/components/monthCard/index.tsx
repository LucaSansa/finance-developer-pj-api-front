import { Divider } from "@mui/material";
import { formatDateBR } from "../../utils/formatDateBR";

interface personalExpenseRegister {
  id: string;
  description: string;
  value: number;
  expenseType: {
    id: string;
    name: string;
  };
}

interface montCardProps {
  closingDate: string;
  ammountCollected: number;
  accountFee: number;
  individualContribuition: number;
  totalInvoiceTax: number;
  personalExpense: personalExpenseRegister[] | [];
  isClosing: boolean;
  onClick?: () => void;
}

export const MonthCard = ({
  closingDate,
  ammountCollected,
  accountFee,
  individualContribuition,
  totalInvoiceTax,
  personalExpense,
  isClosing,
  onClick,
}: montCardProps) => {
  const totalPersonalExpense = personalExpense.reduce(
    (acc, curr) => acc + curr.value,
    0
  );

  return (
    <div
      className="w-full bg-gray-300 rounded-2xl px-4 py-4 cursor-pointer hover:bg-gray-400 transition-colors"
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <h1>Mês de fechamento</h1>
        <h1>{formatDateBR(closingDate)}</h1>
      </div>

      <Divider
        style={{
          marginTop: "4px",
          marginBottom: "4px",
        }}
      />

      <div className="flex justify-between items-center">
        <h1>Valor Arrecadado</h1>
        <h1>R$ {ammountCollected.toFixed(2)}</h1>
      </div>

      <Divider
        style={{
          marginTop: "4px",
          marginBottom: "4px",
        }}
      />

      <div className="flex justify-between items-center">
        <h1>Operacional PJ</h1>
        <h1>
          R${" "}
          {(accountFee + individualContribuition + totalInvoiceTax).toFixed(2)}
        </h1>
      </div>

      <Divider
        style={{
          marginTop: "4px",
          marginBottom: "4px",
        }}
      />

      <div className="flex justify-between items-center">
        <h1>Despesas Pessoais</h1>
        <h1>R$ {totalPersonalExpense.toFixed(2)}</h1>
      </div>

      <Divider
        style={{
          marginTop: "4px",
          marginBottom: "4px",
        }}
      />

      <div className="flex justify-between items-center">
        <h1>Despesa total</h1>
        <h1>
          R${" "}
          {(
            accountFee +
            individualContribuition +
            totalInvoiceTax +
            totalPersonalExpense
          ).toFixed(2)}
        </h1>
      </div>

      <Divider
        style={{
          marginTop: "4px",
          marginBottom: "4px",
        }}
      />

      <div className="flex justify-between items-center">
        <h1>Total restante</h1>
        <h1>
          R${" "}
          {(
            ammountCollected -
            (accountFee +
              individualContribuition +
              totalInvoiceTax +
              totalPersonalExpense)
          ).toFixed(2)}
        </h1>
      </div>

      <Divider
        style={{
          marginTop: "4px",
          marginBottom: "4px",
        }}
      />

      <div className="flex justify-between items-center">
        <h1>Status</h1>
        <h1>{isClosing ? "Fechado" : "Aberto"}</h1>
      </div>
    </div>
  );
};
