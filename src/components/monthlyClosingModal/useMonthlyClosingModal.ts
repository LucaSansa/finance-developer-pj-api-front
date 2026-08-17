import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { currencyMask } from "../../utils/masks";
import { convertCurrencyToNumber } from "../../utils/convertCurrencyToNumber";
import { monthlyClosingSchema } from "../../utils/schemas/monthlyClosingSchema";
import { useCreateMonthlyClosing, useGetOneMonthlyClosing, useUpdateMonthlyClosing } from "../../services/monthlyClosing";
import type { ExpenseItem } from "./types";
import type * as yup from "yup";

type FormData = yup.InferType<typeof monthlyClosingSchema>;

type Options = {
  year: string;
  id?: string;
  onClose: () => void;
  onError?: () => void;
};

const DEFAULT_VALUES: FormData = {
  closingDate: "",
  amountCollected: "",
  accountFee: "",
  individualContribution: "",
  totalInvoiceTax: "",
};

function toCurrencyValue(cents: number) {
  return currencyMask(String(Math.round(cents * 100)));
}

function mapApiExpenses(expenses: { name: string; description: string; value: number; expenseType: { id: string; name: string } }[]): ExpenseItem[] {
  return expenses.map((expense) => ({
    name: expense.name,
    description: expense.description,
    expenseType: expense.expenseType,
    value: toCurrencyValue(expense.value),
  }));
}

export function useMonthlyClosingModal({ year, id, onClose, onError }: Options) {
  const form = useForm<FormData>({
    resolver: yupResolver(monthlyClosingSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { reset, formState: { isDirty, errors }, control } = form;

  const { mutate: create, isPending: isCreating } = useCreateMonthlyClosing();
  const { mutate: update, isPending: isUpdating } = useUpdateMonthlyClosing();
  const { data: closingData, isLoading, isError } = useGetOneMonthlyClosing(id ?? "");

  const isPending = isCreating || isUpdating;

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [initialExpenses, setInitialExpenses] = useState<ExpenseItem[]>([]);
  const [loadedId, setLoadedId] = useState<string | null>(null);

  // Sync expenses during render when API data arrives for a new id
  if (id && closingData && loadedId !== id) {
    setLoadedId(id);
    const mapped = mapApiExpenses(closingData.personalExpense);
    setExpenses(mapped);
    setInitialExpenses(mapped);
  }

  useEffect(() => {
    if (closingData && id) {
      reset({
        closingDate: closingData.closingDate.split("-")[1],
        amountCollected: toCurrencyValue(closingData.amountCollected),
        accountFee: toCurrencyValue(closingData.operacionalPj?.accountFee ?? 0),
        individualContribution: toCurrencyValue(closingData.operacionalPj?.individualContribution ?? 0),
        totalInvoiceTax: toCurrencyValue(closingData.operacionalPj?.totalInvoiceTax ?? 0),
      });
    }
  }, [closingData, id, reset]);

  useEffect(() => {
    if (isError && id) {
      onError?.();
      onClose();
    }
  }, [isError, id, onClose, onError]);

  function clearState() {
    reset();
    setExpenses([]);
    setInitialExpenses([]);
    setLoadedId(null);
  }

  function handleCancel() {
    clearState();
    onClose();
  }

  const handleSubmit = form.handleSubmit((data) => {
    const payload = {
      closingDate: `${year}-${data.closingDate}-01`,
      amountCollected: convertCurrencyToNumber(data.amountCollected),
      operacionalPj: {
        accountFee: convertCurrencyToNumber(data.accountFee),
        individualContribution: convertCurrencyToNumber(data.individualContribution),
        totalInvoiceTax: convertCurrencyToNumber(data.totalInvoiceTax),
      },
      personalExpense: expenses.map((expense) => ({
        name: expense.name,
        description: expense.description,
        value: convertCurrencyToNumber(expense.value),
        expenseTypeId: expense.expenseType.id,
      })),
    };

    if (id) {
      update({ id, data: payload }, {
        onSuccess: () => {
          clearState();
          onClose();
        },
      });
    } else {
      create(payload, {
        onSuccess: () => {
          clearState();
          onClose();
        },
      });
    }
  });

  const addExpense = (expense: ExpenseItem) =>
    setExpenses((prev) => [...prev, expense]);

  const removeExpense = (index: number) =>
    setExpenses((prev) => prev.filter((_, i) => i !== index));

  const hasChanges =
    isDirty || JSON.stringify(expenses) !== JSON.stringify(initialExpenses);

  return {
    control,
    errors,
    expenses,
    addExpense,
    removeExpense,
    handleSubmit,
    handleCancel,
    isPending,
    isLoading,
    hasChanges,
  };
}
