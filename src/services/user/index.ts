import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from ".."

export interface MeResponse {
  name: string
  cnpj: string
  email: string
  taxPercentage: number | null
}

export interface UpdateUser {
  name?: string
  cnpj?: string
  taxPercentage?: number
}

export interface ChangeEmailResquest {
  email: string
}

export interface ChangeEmailRequestResponse {
  message: string
}

export const userService = {
  getMe: async (): Promise<MeResponse> => {
    const response = await api.get<MeResponse>("/users/me")
    return response.data
  },
  updateUser: async (data: UpdateUser): Promise<UpdateUser> => {
    const response = await api.patch<UpdateUser>("/users", data)
    return response.data
  },
  changeEmailResquet: async (data: ChangeEmailResquest): Promise<ChangeEmailRequestResponse> => {
    const response = await api.post<ChangeEmailRequestResponse>("/users/me/email-change", data)
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

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userService.updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] })
    },
  })
}

export const useChangeEmailRequest = () => {
  return useMutation({
    mutationFn: userService.changeEmailResquet,
  })
}
