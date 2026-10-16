import { useQuery } from "@tanstack/react-query"
import { api } from ".."

export interface MeResponse {
  name: string
  cnpj: string
  email: string
  taxPercentage: number | null
}

export const userService = {
  getMe: async (): Promise<MeResponse> => {
    const response = await api.get<MeResponse>("/users/me")
    return response.data
  },
}

export const useGetMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => userService.getMe(),
    enabled: true,
  })
}
