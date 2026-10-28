import { useMutation } from "@tanstack/react-query"
import { api } from "../.."

export interface ConfirmEmailChangeRequest {
  token: string
}

export interface ConfirmEmailChangeResponse {
  message: string
}

export const confirmEmailChangeService = {
  confirmEmailChange: async (
    data: ConfirmEmailChangeRequest,
  ): Promise<ConfirmEmailChangeResponse> => {
    const response = await api.post("/auth/confirm-email-change", data)
    return response.data
  },
}

export const useConfirmEmailChange = () => {
  return useMutation({
    mutationFn: confirmEmailChangeService.confirmEmailChange,
  })
}
