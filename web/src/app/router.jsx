
import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "../admin/layouts/AdminLayout";
import DashboardPage from "../admin/modules/dashboard/DashboardPage";

import PageListPage from "../admin/modules/page/pages/PageListPage";
import PageCreatePage from "../admin/modules/page/pages/PageCreatePage";
import PageEditPage from "../admin/modules/page/pages/PageEditPage";

import MediaLibraryPage from "../admin/modules/media/pages/MediaLibraryPage";

import LoginPage from "../admin/modules/auth/pages/LoginPage";
import AuthGuard from "../admin/modules/auth/components/AuthGuard";
import GuestGuard from "../admin/modules/auth/components/GuestGuard";

export default function AppRouter() {
    return (
        <Routes>
            {/* Guest Routes */}
            <Route
                path="/admin/login"
                element={
                    <GuestGuard>
                        <LoginPage />
                    </GuestGuard>
                }
            />

            {/* Protected Admin Routes */}
            <Route element={<AuthGuard />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route
                        index
                        element={<Navigate to="dashboard" replace />}
                    />

                    <Route
                        path="dashboard"
                        element={<DashboardPage />}
                    />

                    {/* Page Management */}
                    <Route path="pages">
                        <Route index element={<PageListPage />} />

                        <Route
                            path="create"
                            element={<PageCreatePage />}
                        />

                        <Route
                            path=":uuid/edit"
                            element={<PageEditPage />}
                        />
                    </Route>

                   {/* Media Management */}
                    <Route
                        path="media"
                        element={<MediaLibraryPage />}
                    />
                </Route>
            </Route>

            {/* Default */}
            <Route
                path="/"
                element={<Navigate to="/admin/dashboard" replace />}
            />

            {/* Unknown Routes */}
            <Route
                path="*"
                element={<Navigate to="/admin/dashboard" replace />}
            />
        </Routes>
    );
}
