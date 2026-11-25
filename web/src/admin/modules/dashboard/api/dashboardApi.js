import api from "../../../../services/axios";

const dashboardApi = {
    getOverview: async () => {
        const response = await api.get("/dashboard/overview");

        return response.data.data;
    },
};

export default dashboardApi;