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
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
        Nova nota fiscal
      </p>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Valor da nota</label>
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
              className={`h-10 border rounded-md px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                fieldState.invalid ? "border-red-400" : "border-gray-300"
              }`}
            />
          )}
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit(onSubmit)}
        className="mt-4 w-full sm:w-auto px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
      >
        + Adicionar nota
      </button>
    </div>
  );
}
