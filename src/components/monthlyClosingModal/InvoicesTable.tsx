import type { InvoiceItem } from "./types";

type Props = {
  invoices: InvoiceItem[];
  onRemove: (index: number) => void;
};

export function InvoicesTable({ invoices, onRemove }: Props) {
  if (invoices.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-ink-faint uppercase tracking-wide">
        Notas adicionadas ({invoices.length})
      </p>

      <div className="flex flex-col gap-2">
        {invoices.map((invoice, index) => (
          <div
            key={invoice.id ?? index}
            className="border border-line-soft rounded-control px-4 py-3 bg-surface hover:border-line transition-colors flex items-center justify-between gap-3"
          >
            <span className="text-sm font-semibold text-ink tabular-nums">{invoice.value}</span>

            <button
              type="button"
              onClick={() => onRemove(index)}
              title="Remover nota"
              className="w-7 h-7 flex items-center justify-center rounded-full text-ink-muted hover:text-expense hover:bg-expense-soft transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
