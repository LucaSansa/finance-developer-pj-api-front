import { useMutation } from "@tanstack/react-query"
import { api } from "../../index"

export interface ResendEmailConfirmationRequest {
  email: string
}

export interface ResendEmailConfirmationResponse {
  message: string
}

export const resendEmailConfirmationService = {
  resendEmail: async (
    data: ResendEmailConfirmationRequest,
  ): Promise<ResendEmailConfirmationResponse> => {
    const response = await api.post("/auth/resend-verification-email", data)
    return response.data
  },
}

export const useResendEmailConfirmation = () => {
  return useMutation({
    mutationFn: resendEmailConfirmationService.resendEmail,
  })
}
