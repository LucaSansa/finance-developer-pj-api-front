import type { InvoiceItem } from "./types";

type Props = {
  invoices: InvoiceItem[];
  onRemove: (index: number) => void;
};

export function InvoicesTable({ invoices, onRemove }: Props) {
  if (invoices.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Notas adicionadas ({invoices.length})
      </p>

      <div className="flex flex-col gap-2">
        {invoices.map((invoice, index) => (
          <div
            key={invoice.id ?? index}
            className="border border-gray-200 rounded-lg px-4 py-3 bg-white hover:bg-gray-50 transition-colors flex items-center justify-between gap-3"
          >
            <span className="text-base font-semibold text-gray-800">{invoice.value}</span>

            <button
              type="button"
              onClick={() => onRemove(index)}
              title="Remover nota"
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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
