import { api } from "../../index";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    name: string;
    cnpj: string;
    email: string;
  };
  access_token: string;
}

export const loginService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  },
};
