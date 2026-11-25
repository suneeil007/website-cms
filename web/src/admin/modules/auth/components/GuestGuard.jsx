
import { Navigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";

export default function GuestGuard({ children }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div
                    className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
                    role="status"
                    aria-label="Checking authentication"
                />
            </div>
        );
    }

    if (isAuthenticated) {
        return (
            <Navigate
                to="/admin/dashboard"
                replace
            />
        );
    }

    return children;
}
