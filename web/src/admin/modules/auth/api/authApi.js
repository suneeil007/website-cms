
import api, { refreshSession } from "../../../../services/axios";

const authApi = {
    login: async (credentials) => {
        const response = await api.post(
            "/auth/login",
            credentials
        );

        return response.data;
    },

    getProfile: async () => {
        const response = await api.get("/auth/me");

        return response.data;
    },

    refresh: async () => {
        return refreshSession();
    },

    logout: async () => {
        const response = await api.post("/auth/logout");

        return response.data;
    },
};

export default authApi;
