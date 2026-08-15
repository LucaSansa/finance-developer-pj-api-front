import { Controller, useForm } from "react-hook-form";
import { Input } from "../input";
import { currencyMask } from "../../utils/masks";
import { Select } from "../select";
import { useExpenseTypes } from "../../services/expenseTypes";

type PersonalExpensesInputProps = {
  addType: (data: {
    name: string;
    description: string;
    expenseType: {
      id: string;
      name: string;
    };
    value: string;
  }) => void;
};

type PersonalExpesesInputFormData = {
  name: string;
  description: string;
  expenseType: string;
  value: string;
};

export function PersonealExpensesInput({
  addType,
}: PersonalExpensesInputProps) {
  const { handleSubmit, control, reset } = useForm<PersonalExpesesInputFormData>({
    defaultValues: {
      name: "",
      description: "",
      expenseType: "",
      value: "",
    },
  });

  const { data: expenseTypesData, isLoading } = useExpenseTypes();

  const onSubmit = (data: PersonalExpesesInputFormData) => {
    addType({
      name: data.name,
      description: data.description,
      value: data.value,
      expenseType: {
        id: data.expenseType,
        name: expenseTypesData?.find((type) => type.id === data.expenseType)?.name as string,
      },
    });
    reset();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
      <Controller
        name="name"
        control={control}
        rules={{ required: true }}
        render={({ field, fieldState }) => (
          <Input {...field} placeholder="Nome" onChange={field.onChange} error={fieldState.invalid ? "Obrigatório" : undefined} />
        )}
      />

      <Controller
        name="description"
        control={control}
        rules={{ required: true }}
        render={({ field, fieldState }) => (
          <Input {...field} placeholder="Descrição" onChange={field.onChange} error={fieldState.invalid ? "Obrigatório" : undefined} />
        )}
      />

      <Controller
        name="expenseType"
        control={control}
        rules={{ required: true }}
        render={({ field, fieldState }) => (
          <Select
            {...field}
            options={
              expenseTypesData?.map((type) => ({
                value: type.id,
                label: type.name,
              })) || []
            }
            initialLabel="Tipo"
            error={fieldState.invalid ? "Obrigatório" : undefined}
          />
        )}
      />

      <Controller
        name="value"
        control={control}
        rules={{ required: true, validate: (v) => v !== "R$ 0,00" }}
        render={({ field, fieldState }) => (
          <Input
            {...field}
            inputMode="numeric"
            placeholder="R$ 0,00"
            onChange={(e) => field.onChange(currencyMask(e.target.value))}
            error={fieldState.invalid ? "Obrigatório" : undefined}
          />
        )}
      />
      <button
        type="button"
        onClick={handleSubmit(onSubmit)}
        className="cursor-pointer rounded py-2 bg-blue-600 text-white"
      >
        Adicionar
      </button>
    </div>
  );
}
