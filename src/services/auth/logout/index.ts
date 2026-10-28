import {api} from "../../index";

export const authLogoutService = {
    logout: async (): Promise<void> => {
        await api.post("/auth/logout")
    },
}