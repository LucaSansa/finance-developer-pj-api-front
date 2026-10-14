import { Layout } from "../../components/layout";
import { YearSelector } from "../../components/yearSelector";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetMonthlyClosings } from "../../services/monthlyClosing";
import { MonthCard } from "../../components/monthCard";

export const Dashboard = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [startDate, setStartDate] = useState(`${currentYear}-01-01`);
  const [endDate, setEndDate] = useState(`${currentYear}-12-31`);
  const navigate = useNavigate();

  const { data, isLoading } = useGetMonthlyClosings({
    page: 1,
    limit: 12,
    startDate: startDate,
    endDate: endDate,
  });

  const total = data?.data?.length ?? 0;

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-ink tracking-tight">Fechamentos mensais</h1>
          <p className="text-sm text-ink-faint">
            {total}/12 meses cadastrados em {year}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <YearSelector
            year={year}
            onChangeYear={(selectedYear) => {
              setYear(selectedYear);
              setStartDate(`${selectedYear}-01-01`);
              setEndDate(`${selectedYear}-12-31`);
            }}
          />

          <button
            type="button"
            onClick={() => navigate(`/fechamento-mensal?year=${year}`)}
            className="h-10 px-4 rounded-control bg-brand text-white text-sm font-medium hover:bg-brand-strong transition-colors whitespace-nowrap"
          >
            + Novo fechamento
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-56 rounded-card border border-line-soft bg-surface animate-pulse"
            />
          ))}
        </div>
      )}

      {!isLoading && total === 0 && (
        <div className="flex flex-col items-center justify-center text-center gap-3 border border-dashed border-line rounded-card py-20 px-6">
          <div className="w-12 h-12 rounded-full bg-brand-soft text-brand flex items-center justify-center text-xl font-semibold">
            {year}
          </div>
          <p className="text-ink font-medium">Nenhum fechamento cadastrado em {year}</p>
          <p className="text-sm text-ink-faint max-w-sm">
            Comece adicionando o primeiro mês para acompanhar notas fiscais, custo operacional e despesas pessoais.
          </p>
          <button
            type="button"
            onClick={() => navigate(`/fechamento-mensal?year=${year}`)}
            className="mt-2 h-10 px-4 rounded-control bg-brand text-white text-sm font-medium hover:bg-brand-strong transition-colors"
          >
            + Novo fechamento
          </button>
        </div>
      )}

      {!isLoading && total > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
              onClick={() => navigate(`/fechamento-mensal/${closing.id}?year=${year}`)}
            />
          ))}
        </div>
      )}
    </Layout>
  );
};
