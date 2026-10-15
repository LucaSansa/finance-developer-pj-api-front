import { useMutation } from "@tanstack/react-query"
import { api } from "../../index"

export interface ResetPasswordRequest {
  token: string
  password: string
}

export interface ResetPasswordResponse {
  message: string
}

export const ResetPasswordService = {
  resetPassword: async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    const response = await api.post("/auth/reset-password", data)
    return response.data
  },
}

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ResetPasswordService.resetPassword,
  })
}
