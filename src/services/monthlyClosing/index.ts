import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "..";
import type { CreateMonthlyClosing, MonthlyClosing, MonthlyClosingFilters, MonthlyClosingResponse, UpdateMonthlyClosing } from "./types";



export const monthlyClosingService = {
  getMonthlyClosings: async (
    filters?: MonthlyClosingFilters
  ): Promise<MonthlyClosingResponse> => {
    const response = await api.get<MonthlyClosingResponse>(
      "/monthly-closing/find-all",
      {
        params: {
          page: filters?.page,
          limit: filters?.limit,
          startDate: filters?.startDate,
          endDate: filters?.endDate,
        },
      }
    );
    return response.data;
  },
  getOneMonthlyClosing: async (id: string): Promise<MonthlyClosing> => {
    const response = await api.get<MonthlyClosing>(`/monthly-closing/find-one/${id}`);
    return response.data;
  },
  createMonthlyClosing: async (data: CreateMonthlyClosing): Promise<MonthlyClosing> => {
    const response = await api.post<MonthlyClosing>("/monthly-closing", data);
    return response.data;
  },
  updateMonthlyClosing: async (id: string, data: UpdateMonthlyClosing): Promise<MonthlyClosing> => {
    const response = await api.patch<MonthlyClosing>(`/monthly-closing/${id}`, data);
    return response.data;
  },
};

export const useGetMonthlyClosings = (filters?: MonthlyClosingFilters) => {
  return useQuery({
    queryKey: ["monthlyClosings", filters],
    queryFn: () => monthlyClosingService.getMonthlyClosings(filters),
    enabled: true,
  });
};

export const useCreateMonthlyClosing = () => { 
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMonthlyClosing) => monthlyClosingService.createMonthlyClosing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthlyClosings"] });
    },
  });
};

export const useUpdateMonthlyClosing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMonthlyClosing }) =>
      monthlyClosingService.updateMonthlyClosing(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["monthlyClosings"] });
      queryClient.invalidateQueries({ queryKey: ["monthlyClosing", id] });
    },
  });
};

export const useGetOneMonthlyClosing = (id: string) => {
  return useQuery({
    queryKey: ["monthlyClosing", id],
    queryFn: () => monthlyClosingService.getOneMonthlyClosing(id),
    enabled: !!id,
  });
};

