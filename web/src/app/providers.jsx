
import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import {
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";
import { Toaster } from "sonner";

import useAuthStore from "@/stores/authStore";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});

export default function Providers({ children }) {
    const initializeAuth = useAuthStore(
        (state) => state.initializeAuth
    );

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                {children}
                <Toaster position="top-right" richColors />
            </BrowserRouter>
        </QueryClientProvider>
    );
}
