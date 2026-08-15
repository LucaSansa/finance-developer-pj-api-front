import { useQuery } from "@tanstack/react-query";
import { api } from "..";

export interface ExpenseTypes {
  id: string;
  createdAt: string;
  name: string;
}

export type ExpenseTypesResponse = ExpenseTypes[];

export const getExpenseTypes = async (): Promise<ExpenseTypesResponse> => {
  const response = await api.get<ExpenseTypesResponse>(
    "/personal-expenses/expense-types"
  );
  return response.data;
};

export const useExpenseTypes = () => {
  return useQuery({
    queryKey: ["expenseTypes"],
    queryFn: () => getExpenseTypes(),
    enabled: true,
  });
};

export default getExpenseTypes;
