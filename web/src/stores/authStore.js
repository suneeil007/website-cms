
import { create } from "zustand";

import authApi from "../admin/modules/auth/api/authApi";

import {
    setAccessToken,
    clearAccessToken,
} from "../services/token";

// Prevent duplicate initialization.
let initializePromise = null;

// Track authentication operations.
let authOperation = 0;

const useAuthStore = create((set, get) => ({
    user: null,

    isAuthenticated: false,

    isLoading: true,

    hasInitialized: false,

    error: null,

    // ==========================================
    // ADMIN LOGIN
    // ==========================================

    login: async (credentials) => {
        const operation = ++authOperation;

        set({
            isLoading: true,
            error: null,
        });

        try {
            const response = await authApi.login(credentials);

            const payload = response?.data;

            const accessToken = payload?.accessToken;
            const admin = payload?.admin;

            if (!accessToken || !admin?.uuid) {
                throw new Error("Invalid login response.");
            }

            // Ignore stale login operations.
            if (operation !== authOperation) {
                return {
                    success: false,
                    message: "Login operation was superseded.",
                };
            }

            setAccessToken(accessToken);

            set({
                user: admin,
                isAuthenticated: true,
                isLoading: false,
                hasInitialized: true,
                error: null,
            });

            return {
                success: true,
                user: admin,
            };

        } catch (error) {
            if (operation !== authOperation) {
                return {
                    success: false,
                    message: "Login operation was superseded.",
                };
            }

            clearAccessToken();

            const message =
                error.response?.data?.message ||
                error.message ||
                "Login failed.";

            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                hasInitialized: true,
                error: message,
            });

            return {
                success: false,
                message,
            };
        }
    },

    // ==========================================
    // INITIALIZE / RESTORE AUTHENTICATION
    // ==========================================

    initializeAuth: async () => {
        if (get().hasInitialized) {
            return;
        }

        if (initializePromise) {
            return initializePromise;
        }

        const operation = authOperation;

        initializePromise = (async () => {
            set({
                isLoading: true,
                error: null,
            });

            try {
                // Restore session using HTTP-only cookie.
                const refreshResponse = await authApi.refresh();

                const refreshData = refreshResponse?.data;

                const accessToken = refreshData?.accessToken;

                if (!accessToken) {
                    throw new Error("Unable to restore session.");
                }

                // Do not overwrite a newer login/logout operation.
                if (operation !== authOperation) {
                    return;
                }

                setAccessToken(accessToken);

                // Load authenticated administrator profile.
                const profileResponse = await authApi.getProfile();

                // Backend response: data.user
                const user = profileResponse?.data?.user;

                if (!user?.uuid) {
                    throw new Error("Unable to load admin profile.");
                }

                if (operation !== authOperation) {
                    return;
                }

                set({
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                    hasInitialized: true,
                    error: null,
                });

            } catch (error) {
                // Ignore initialization errors if another
                // authentication operation has superseded us.
                if (operation !== authOperation) {
                    return;
                }

                clearAccessToken();

                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                    hasInitialized: true,
                    error: null,
                });

            } finally {
                initializePromise = null;
            }
        })();

        return initializePromise;
    },

    // ==========================================
    // LOGOUT
    // ==========================================

    logout: async () => {
        // Invalidate pending login/initialization operations.
        ++authOperation;

        // Clear local authentication immediately.
        clearAccessToken();

        set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            hasInitialized: true,
            error: null,
        });

        try {
            await authApi.logout();

        } catch (error) {
            console.error("Logout API error:", error);
        }
    },

    // ==========================================
    // SESSION EXPIRED
    // ==========================================

    handleSessionExpired: () => {
        ++authOperation;

        clearAccessToken();

        set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            hasInitialized: true,
            error: null,
        });
    },

    // ==========================================
    // CLEAR ERROR
    // ==========================================

    clearError: () => set({ error: null }),
}));

// ==========================================
// SESSION EXPIRED EVENT
// ==========================================

if (typeof window !== "undefined") {
    window.addEventListener(
        "auth:session-expired",
        () => {
            useAuthStore.getState().handleSessionExpired();
        }
    );
}

export default useAuthStore;
