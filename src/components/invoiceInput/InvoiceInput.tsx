import { Controller, useForm } from "react-hook-form";
import { currencyMask } from "../../utils/masks";

type InvoiceInputProps = {
  addInvoice: (data: { value: string }) => void;
};

type FormData = {
  value: string;
};

export function InvoiceInput({ addInvoice }: InvoiceInputProps) {
  const { handleSubmit, control, reset } = useForm<FormData>({
    defaultValues: { value: "" },
  });

  const onSubmit = (data: FormData) => {
    addInvoice({ value: data.value });
    reset();
  };

  return (
    <div className="border border-line-soft rounded-card p-4 bg-surface-inset/40">
      <p className="text-xs font-medium text-ink-faint uppercase tracking-wide mb-3">
        Nova nota fiscal
      </p>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-ink-soft">Valor da nota</label>
        <Controller
          name="value"
          control={control}
          rules={{ required: true, validate: (v) => v !== "R$ 0,00" }}
          render={({ field, fieldState }) => (
            <input
              {...field}
              inputMode="numeric"
              placeholder="R$ 0,00"
              onChange={(e) => field.onChange(currencyMask(e.target.value))}
              className={`h-10 rounded-control border bg-surface px-3 text-sm text-ink outline-none transition-colors focus:ring-2 focus:ring-brand/30 ${
                fieldState.invalid ? "border-expense" : "border-line focus:border-brand"
              }`}
            />
          )}
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit(onSubmit)}
        className="mt-4 w-full sm:w-auto px-5 py-2.5 rounded-control bg-ink text-white text-sm font-medium hover:bg-ink-soft transition-colors"
      >
        + Adicionar nota
      </button>
    </div>
  );
}
