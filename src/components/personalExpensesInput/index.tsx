import { Controller, useForm } from "react-hook-form";
import { currencyMask } from "../../utils/masks";
import { SearchableSelect } from "../searchableSelect";
import { useExpenseTypes } from "../../services/expenseTypes";

type PersonalExpensesInputProps = {
  addType: (data: {
    name: string;
    description: string;
    expenseType: { id: string; name: string };
    value: string;
  }) => void;
};

type FormData = {
  name: string;
  description: string;
  expenseType: string;
  value: string;
};

export function PersonealExpensesInput({ addType }: PersonalExpensesInputProps) {
  const { handleSubmit, control, reset } = useForm<FormData>({
    defaultValues: { name: "", description: "", expenseType: "", value: "" },
  });

  const { data: expenseTypes, isLoading } = useExpenseTypes();

  const expenseTypeOptions =
    expenseTypes?.map((t) => ({ value: t.id, label: t.name })) ?? [];

  const onSubmit = (data: FormData) => {
    addType({
      name: data.name,
      description: data.description,
      value: data.value,
      expenseType: {
        id: data.expenseType,
        name: expenseTypes?.find((t) => t.id === data.expenseType)?.name ?? "",
      },
    });
    reset();
  };

  return (
    <div className="border border-line-soft rounded-card p-4 bg-surface-inset/40">
      <p className="text-xs font-medium text-ink-faint uppercase tracking-wide mb-3">
        Novo gasto
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-ink-soft">Nome</label>
          <Controller
            name="name"
            control={control}
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <input
                {...field}
                placeholder="Ex: Aluguel"
                className={`h-10 rounded-control border bg-surface px-3 text-sm text-ink outline-none transition-colors focus:ring-2 focus:ring-brand/30 ${
                  fieldState.invalid ? "border-expense" : "border-line focus:border-brand"
                }`}
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-ink-soft">Descrição</label>
          <Controller
            name="description"
            control={control}
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <input
                {...field}
                placeholder="Ex: Aluguel residencial"
                className={`h-10 rounded-control border bg-surface px-3 text-sm text-ink outline-none transition-colors focus:ring-2 focus:ring-brand/30 ${
                  fieldState.invalid ? "border-expense" : "border-line focus:border-brand"
                }`}
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-ink-soft">Tipo</label>
          <Controller
            name="expenseType"
            control={control}
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <SearchableSelect
                {...field}
                options={expenseTypeOptions}
                placeholder={isLoading ? "Carregando..." : "Selecionar tipo"}
                error={fieldState.invalid ? "Obrigatório" : undefined}
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-ink-soft">Valor</label>
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
      </div>

      <button
        type="button"
        onClick={handleSubmit(onSubmit)}
        className="mt-4 w-full sm:w-auto px-5 py-2.5 rounded-control bg-ink text-white text-sm font-medium hover:bg-ink-soft transition-colors"
      >
        + Adicionar gasto
      </button>
    </div>
  );
}
