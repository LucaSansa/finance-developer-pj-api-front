import { useMutation } from "@tanstack/react-query"
import { api } from "../../index"

export interface ConfirmEmailRequest {
  token: string
}

export interface ConfirmEmailResponse {
  message: string
}

export const confirmEmailService = {
  confirmEmail: async (data: ConfirmEmailRequest): Promise<ConfirmEmailResponse> => {
    const response = await api.post("/auth/verify-email", data)
    return response.data
  },
}

export const useConfirmEmail = () => {
  return useMutation({
    mutationFn: confirmEmailService.confirmEmail,
  })
}
