import { useMutation } from "@tanstack/react-query"
import { api } from "../../index"

export interface SignupRequest {
  name: string
  cnpj: string
  email: string
  password: string
}

export interface SignupResponse {
  message: string
}

export const signupService = {
  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    const response = await api.post<SignupResponse>("/users", data)
    return response.data
  },
}

export const useSignup = () => {
  return useMutation({
    mutationFn: signupService.signup,
  })
}
