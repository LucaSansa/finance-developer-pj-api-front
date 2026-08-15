import { Controller, type Control, type Path, type FieldValues } from "react-hook-form";
import { Input } from "../input";
import { currencyMask } from "../../utils/masks";

type Props<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  control: Control<T>;
  error?: string;
};

export function CurrencyField<T extends FieldValues>({ label, name, control, error }: Props<T>) {
  return (
    <div>
      <span>{label}</span>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            inputMode="numeric"
            placeholder="R$ 0,00"
            onChange={(e) => field.onChange(currencyMask(e.target.value))}
            error={error}
          />
        )}
      />
    </div>
  );
}
