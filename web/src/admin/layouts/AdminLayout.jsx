
import { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <AdminSidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                collapsed={collapsed}
                onToggleCollapse={() => setCollapsed(!collapsed)}
            />

            <div
                className={`
                    min-h-screen transition-all duration-300
                    ${collapsed ? "lg:ml-[80px]" : "lg:ml-[260px]"}
                `}
            >
                <AdminHeader
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto max-w-[1600px]">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
