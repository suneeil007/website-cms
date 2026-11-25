
import useAuthStore from "../../../../stores/authStore";

export default function useAuth() {
    const user = useAuthStore((state) => state.user);
    const isAuthenticated = useAuthStore(
        (state) => state.isAuthenticated
    );
    const isLoading = useAuthStore(
        (state) => state.isLoading
    );
    const error = useAuthStore((state) => state.error);

    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);
    const initializeAuth = useAuthStore(
        (state) => state.initializeAuth
    );
    const clearError = useAuthStore(
        (state) => state.clearError
    );

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        initializeAuth,
        clearError,
    };
}
