import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export interface RefreshResponse {
    access_token: string
}

const refreshApi = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

export const authRefreshService = {
    refresh: async (): Promise<RefreshResponse> => {
        const response = await refreshApi.post<RefreshResponse>("/auth/refresh");
        return response.data
    }
}