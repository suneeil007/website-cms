
import axios from "axios";

import {
    getAccessToken,
    setAccessToken,
    clearAccessToken,
} from "./token";

const BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api/v1";

// ==========================================
// MAIN API CLIENT
// ==========================================

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// ==========================================
// REFRESH CLIENT
// ==========================================

const refreshClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

// ==========================================
// HEADER HELPERS
// ==========================================

function getAuthorization(headers) {
    if (!headers) return undefined;

    if (typeof headers.get === "function") {
        return (
            headers.get("Authorization") ??
            headers.get("authorization")
        );
    }

    return (
        headers.Authorization ??
        headers.authorization
    );
}

function setAuthorization(headers, token) {
    if (typeof headers.set === "function") {
        headers.set("Authorization", `Bearer ${token}`);
    } else {
        headers.Authorization = `Bearer ${token}`;
    }
}

// ==========================================
// SHARED REFRESH PROMISE
// ==========================================

let refreshPromise = null;

export const refreshSession = async () => {
    if (!refreshPromise) {
        refreshPromise = refreshClient
            .post("/auth/refresh")
            .then((response) => {
                const accessToken =
                    response.data?.data?.accessToken;

                if (!accessToken) {
                    throw new Error(
                        "Refresh response did not contain an access token."
                    );
                }

                setAccessToken(accessToken);

                return response.data;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
};

// ==========================================
// SESSION EXPIRED EVENT
// ==========================================

function dispatchSessionExpired() {
    clearAccessToken();

    if (typeof window !== "undefined") {
        window.dispatchEvent(
            new Event("auth:session-expired")
        );
    }
}

// ==========================================
// REQUEST INTERCEPTOR
// ==========================================

api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();

        config.headers = config.headers || {};

        if (token) {
            setAuthorization(config.headers, token);
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ==========================================
// RESPONSE INTERCEPTOR
// ==========================================

api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status !== 401 ||
            !originalRequest ||
            originalRequest.url?.includes("/auth/login") ||
            originalRequest.url?.includes("/auth/refresh") ||
            originalRequest.url?.includes("/auth/logout")
        ) {
            return Promise.reject(error);
        }

        // Prevent infinite retry loops.
        if (originalRequest._retry) {
            dispatchSessionExpired();
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        // ======================================
        // Check if another request refreshed
        // the access token already.
        // ======================================

        const previousAuthorization =
            getAuthorization(originalRequest.headers);

        const currentToken = getAccessToken();

        if (
            currentToken &&
            previousAuthorization &&
            previousAuthorization !== `Bearer ${currentToken}`
        ) {
            originalRequest.headers =
                originalRequest.headers || {};

            setAuthorization(
                originalRequest.headers,
                currentToken
            );

            return api(originalRequest);
        }

        // ======================================
        // Refresh access token
        // ======================================

        let refreshResponse;

        try {
            refreshResponse = await refreshSession();

        } catch (refreshError) {
            dispatchSessionExpired();
            return Promise.reject(refreshError);
        }

        const newToken =
            refreshResponse?.data?.accessToken;

        if (!newToken) {
            dispatchSessionExpired();

            return Promise.reject(
                new Error("Unable to refresh session.")
            );
        }

        // ======================================
        // Retry original request
        // ======================================

        originalRequest.headers =
            originalRequest.headers || {};

        setAuthorization(
            originalRequest.headers,
            newToken
        );

        return api(originalRequest);
    }
);

export default api;
