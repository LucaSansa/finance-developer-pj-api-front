import { useMutation } from "@tanstack/react-query"
import { api } from "../../index"

export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  message: string
}

export const forgotPasswordService = {
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const response = await api.post("/auth/forgot-password", data)
    return response.data
  },
}

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPasswordService.forgotPassword,
  })
}

// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
// import { api } from ".."

// export interface Profile {
//   id: string
//   name: string
//   email: string
// }

// export interface UpdateProfileData {
//   name: string
// }

// const getProfile = async (): Promise<Profile> => {
//   const response = await api.get<Profile>("/profile")
//   return response.data
// }

// const updateProfile = async (data: UpdateProfileData): Promise<Profile> => {
//   const response = await api.patch<Profile>("/profile", data)
//   return response.data
// }

// export const useProfile = () => {
//   return useQuery({
//     queryKey: ["profile"],
//     queryFn: getProfile,
//   })
// }

// export const useUpdateProfile = () => {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: updateProfile,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["profile"] })
//     },
//   })
// }
