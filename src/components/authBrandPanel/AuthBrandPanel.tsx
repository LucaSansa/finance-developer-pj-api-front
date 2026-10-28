import { BalanceBar } from "../balanceBar/BalanceBar"

export function AuthBrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-ink relative overflow-hidden flex-col justify-between p-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(79,70,192,0.35),transparent_55%)]" />

      <div className="relative flex items-center gap-3">
        <div className="w-10 h-10 rounded-control bg-brand text-white flex items-center justify-center font-bold text-sm">
          FD
        </div>
        <span className="text-white font-semibold">Finance Developer</span>
      </div>

      <div className="relative flex flex-col gap-6 max-w-md">
        <h1 className="text-4xl font-semibold text-white leading-tight tracking-tight">
          Seu fechamento mensal, sempre no controle.
        </h1>
        <p className="text-white/60 text-base">
          Notas fiscais, custo operacional e despesas pessoais organizados mês a mês, ano a ano.
        </p>

        <div className="rounded-panel bg-white/6 border border-white/10 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-white/70">Setembro 2026</span>
            <span className="text-xs font-medium text-income bg-income-soft px-2 py-0.5 rounded-full">
              Aberto
            </span>
          </div>
          <p className="text-2xl font-semibold text-white mb-4 tabular-nums">R$ 20.000,50</p>
          <BalanceBar
            collected={20000.5}
            segments={[
              {
                key: "operacional",
                label: "Operacional",
                value: 3250.03,
                trackClass: "bg-tax",
                dotClass: "bg-tax",
              },
              {
                key: "despesas",
                label: "Despesas",
                value: 1200.5,
                trackClass: "bg-expense",
                dotClass: "bg-expense",
              },
            ]}
            size="sm"
          />
        </div>
      </div>

      <p className="relative text-xs text-white/40">
        &copy; {new Date().getFullYear()} LPM Systems
      </p>
    </div>
  )
}
