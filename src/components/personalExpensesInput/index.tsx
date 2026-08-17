import { Controller, useForm } from "react-hook-form";
import { Input } from "../input";
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
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
        Novo gasto
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Nome</label>
          <Controller
            name="name"
            control={control}
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <input
                {...field}
                placeholder="Ex: Aluguel"
                className={`h-10 border rounded-md px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  fieldState.invalid ? "border-red-400" : "border-gray-300"
                }`}
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Descrição</label>
          <Controller
            name="description"
            control={control}
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <input
                {...field}
                placeholder="Ex: Aluguel residencial"
                className={`h-10 border rounded-md px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  fieldState.invalid ? "border-red-400" : "border-gray-300"
                }`}
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Tipo</label>
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

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Valor</label>
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
      </div>

      <button
        type="button"
        onClick={handleSubmit(onSubmit)}
        className="mt-4 w-full sm:w-auto px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
      >
        + Adicionar gasto
      </button>
    </div>
  );
}
