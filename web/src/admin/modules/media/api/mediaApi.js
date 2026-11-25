
import api from "@/services/axios";

// GET MEDIA LIST
export async function getMedia(params = {}) {
    const response = await api.get("/media", { params });
    return response.data.data;
}

// GET MEDIA DETAILS
export async function getMediaByUuid(uuid) {
    const response = await api.get(`/media/${uuid}`);
    return response.data.data;
}

// UPLOAD MULTIPLE FILES
export async function uploadMedia(files) {
    const formData = new FormData();

    Array.from(files).forEach((file) => {
        formData.append("files", file);
    });

    const response = await api.post(
        "/media/upload",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data.data;
}

// UPDATE MEDIA
export async function updateMedia(uuid, payload) {
    const response = await api.put(
        `/media/${uuid}`,
        payload
    );

    return response.data.data;
}

// ATTACH MEDIA TO PAGE
export async function attachMediaToPage(uuid, payload) {
    const response = await api.post(
        `/media/${uuid}/attach`,
        payload
    );

    return response.data.data;
}

// DELETE MEDIA
export async function deleteMedia(uuid) {
    const response = await api.delete(`/media/${uuid}`);
    return response.data;
}

// AUTHENTICATED DOWNLOAD / PREVIEW
export async function downloadMedia(uuid) {
    const response = await api.get(
        `/media/${uuid}/download`,
        {
            responseType: "blob",
        }
    );

    return response.data;
}
