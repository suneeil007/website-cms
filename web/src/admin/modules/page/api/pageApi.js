
import api from "@/services/axios";

const BASE_URL = "/page";
const MEDIA_URL = "/media";

const pageApi = {
    getAll: async (params = {}) => {
        const response = await api.get(BASE_URL, { params });
        return response.data.data ?? response.data;
    },

    getByUuid: async (uuid) => {
        const response = await api.get(`${BASE_URL}/${uuid}`);
        return response.data.data ?? response.data;
    },

    create: async (payload) => {
        const response = await api.post(BASE_URL, payload);
        return response.data.data ?? response.data;
    },

    update: async (uuid, payload) => {
        const response = await api.put(`${BASE_URL}/${uuid}`, payload);
        return response.data.data ?? response.data;
    },

    delete: async (uuid) => {
        const response = await api.delete(`${BASE_URL}/${uuid}`);
        return response.data;
    },

    attachMedia: async (mediaUuid, payload) => {
        const response = await api.post(
            `${MEDIA_URL}/${mediaUuid}/attach`,
            payload
        );

        return response.data.data ?? response.data;
    },

    detachMedia: async (mediaUuid, pageUuid) => {
        const response = await api.delete(
            `${MEDIA_URL}/${mediaUuid}/detach`,
            { data: { pageUuid } }
        );

        return response.data;
    },

    attachMedia: async (mediaUuid, payload) => {
        const response = await api.post(
            `/media/${mediaUuid}/attach`,
            payload
        );

        return response.data.data ?? response.data;
    },

    detachMedia: async (mediaUuid, pageUuid) => {
        const response = await api.delete(
            `/media/${mediaUuid}/detach`,
            {
                data: { pageUuid },
            }
        );

        return response.data;
    },
};

export default pageApi;
