import { Button } from "@mui/material";
import { Layout } from "../../components/layout";
import { YearSelector } from "../../components/yearSelector";
import { useState } from "react";
import { useGetMonthlyClosings } from "../../services/monthlyClosing";
import { MonthCard } from "../../components/monthCard";
import { MonthlyClosingModal } from "../../components/monthlyClosingModal";

export const Dashboard = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(`${currentYear}-12-31`);

  const { data, isLoading } = useGetMonthlyClosings({
    page: 1,
    limit: 12,
    startDate: startDate,
    endDate: endDate,
  });

  console.log(isLoading, year);

  const [openModal, setOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <>
    <Layout>
      <div className="w-full flex justify-between mb-6">
        <Button variant="contained" onClick={() => setOpenModal(true)}>
          {`ADICIONAR NOVO FECHAMENTO: ${data?.data?.length || 0}/12`}
        </Button>

        <MonthlyClosingModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setSelectedId(null);
          }}
          year={String(year)}
          id={selectedId ?? undefined}
          onError={() => alert("Erro ao carregar o fechamento. Tente novamente.")}
        />

        <YearSelector
          year={year}
          onChangeYear={(selectedYear) => {
            setYear(selectedYear);
            setStartDate(`${selectedYear}-01-01`);
            setEndDate(`${selectedYear}-12-31`);
          }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-14 mb-6">
        {data?.data.map((closing) => (
          <MonthCard
            key={closing.id}
            closingDate={closing.closingDate}
            ammountCollected={closing.amountCollected}
            accountFee={closing.operacionalPj?.accountFee || 0}
            individualContribuition={
              closing.operacionalPj?.individualContribution || 0
            }
            totalInvoiceTax={closing.operacionalPj?.totalInvoiceTax || 0}
            personalExpense={closing.personalExpense}
            isClosing={closing.isClosing}
            onClick={() => {
              setSelectedId(closing.id);
              setOpenModal(true);
            }}
          />
        ))}
      </div>
    </Layout>
    </>
  );
};
