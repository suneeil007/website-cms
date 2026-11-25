
import { Navigate, Outlet, useLocation } from "react-router-dom";

import useAuth from "../hooks/useAuth";

export default function AuthGuard() {
    const {
        isAuthenticated,
        isLoading,
        user,
        hasInitialized,
    } = useAuth();

    const location = useLocation();

    console.log("AUTH GUARD:", {
        pathname: location.pathname,
        isAuthenticated,
        isLoading,
        hasInitialized,
        user,
    });

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/admin/login"
                replace
                state={{ from: location }}
            />
        );
    }

    return <Outlet />;
}
