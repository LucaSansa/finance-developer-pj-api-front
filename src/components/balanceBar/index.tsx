import { formatCurrencyBRL } from "../../utils/formatCurrencyBRL";
import { mergeClassnames } from "../../utils/mergeClassnames";

export type BalanceSegment = {
  key: string;
  label: string;
  value: number;
  trackClass: string;
  dotClass: string;
};

type Props = {
  collected: number;
  segments: BalanceSegment[];
  size?: "sm" | "md";
};

// Assinatura visual: livro-caixa em miniatura — como o arrecadado se reparte entre custos e sobra.
export function BalanceBar({ collected, segments, size = "md" }: Props) {
  const spent = segments.reduce((acc, segment) => acc + segment.value, 0);
  const remaining = collected - spent;
  const overBudget = remaining < 0;
  const basis = Math.max(collected, spent, 1);

  return (
    <div className="flex flex-col gap-3">
      <div
        className={mergeClassnames(
          "w-full rounded-full bg-surface-inset overflow-hidden flex",
          size === "sm" ? "h-1.5" : "h-2.5"
        )}
      >
        {segments.map(
          (segment) =>
            segment.value > 0 && (
              <div
                key={segment.key}
                className={segment.trackClass}
                style={{ width: `${(segment.value / basis) * 100}%` }}
                title={`${segment.label}: ${formatCurrencyBRL(segment.value)}`}
              />
            )
        )}
        {!overBudget && remaining > 0 && (
          <div
            className="bg-income"
            style={{ width: `${(remaining / basis) * 100}%` }}
            title={`Saldo restante: ${formatCurrencyBRL(remaining)}`}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {segments.map(
          (segment) =>
            segment.value > 0 && (
              <span key={segment.key} className="flex items-center gap-1.5 text-xs text-ink-faint">
                <span className={mergeClassnames("w-2 h-2 rounded-full shrink-0", segment.dotClass)} />
                {segment.label}
              </span>
            )
        )}
        <span className="flex items-center gap-1.5 text-xs text-ink-faint">
          <span
            className={mergeClassnames(
              "w-2 h-2 rounded-full shrink-0",
              overBudget ? "bg-expense" : "bg-income"
            )}
          />
          Saldo restante
        </span>
      </div>
    </div>
  );
}
