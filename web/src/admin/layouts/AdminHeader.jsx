
import { useState } from "react";
import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    Menu,
    Search,
    Bell,
    ChevronDown,
    LogOut,
    User,
} from "lucide-react";

import useAuth from "../modules/auth/hooks/useAuth";

const pageTitles = {
    dashboard: "Dashboard",
    pages: "Pages",
    news: "News",
    categories: "Categories",
    media: "Media Library",
    users: "Users",
    roles: "Roles & Permissions",
    settings: "Settings",
};

export default function AdminHeader({ onMenuClick }) {
    const location = useLocation();
    const navigate = useNavigate();

    const { user, logout } = useAuth();

    const [profileOpen, setProfileOpen] = useState(false);

    const currentPage =
        location.pathname.split("/").filter(Boolean).pop();

    const title = pageTitles[currentPage] || "Dashboard";

    const fullName = [
        user?.firstName,
        user?.lastName,
    ].filter(Boolean).join(" ") || "Administrator";

    const initials = fullName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");

    const email = user?.email || "";

    const role =
        user?.role?.name ||
        user?.roles?.[0]?.name ||
        "Administrator";

    const handleLogout = async () => {
        setProfileOpen(false);

        await logout();

        navigate("/admin/login", {
            replace: true,
        });
    };

    return (
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">

            {/* Left */}
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onMenuClick}
                    aria-label="Open navigation"
                    className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
                >
                    <Menu size={22} />
                </button>

                <div>
                    <h1 className="text-lg font-bold text-gray-900">
                        {title}
                    </h1>

                    <p className="hidden text-xs text-gray-500 sm:block">
                        Manage your website content
                    </p>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 sm:gap-4">

                {/* Search */}
                <div className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 md:flex">
                    <Search size={16} className="text-gray-400" />

                    <input
                        type="search"
                        placeholder="Search..."
                        aria-label="Search"
                        className="w-36 bg-transparent text-xs outline-none lg:w-48"
                    />

                    <kbd className="rounded border bg-white px-1.5 py-0.5 text-[10px] text-gray-400">
                        /
                    </kbd>
                </div>

                {/* Notifications */}
                <button
                    type="button"
                    aria-label="Notifications"
                    className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                >
                    <Bell size={20} />
                </button>

                {/* Profile */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setProfileOpen((prev) => !prev)}
                        aria-expanded={profileOpen}
                        aria-haspopup="menu"
                        className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-50"
                    >
                        <div className="flex size-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                            {initials || "A"}
                        </div>

                        <div className="hidden text-left sm:block">
                            <p className="text-xs font-semibold text-gray-800">
                                {fullName}
                            </p>

                            <p className="text-[10px] text-gray-500">
                                {role}
                            </p>
                        </div>

                        <ChevronDown
                            size={15}
                            className="hidden text-gray-400 sm:block"
                        />
                    </button>

                    {profileOpen && (
                        <div
                            role="menu"
                            className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
                        >
                            <div className="border-b border-gray-100 p-4">
                                <p className="font-semibold text-gray-900">
                                    {fullName}
                                </p>

                                <p className="mt-1 truncate text-xs text-gray-500">
                                    {email}
                                </p>

                                <span className="mt-2 inline-block rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                                    {role}
                                </span>
                            </div>

                            <div className="p-2">
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        setProfileOpen(false);
                                        navigate("/admin/profile");
                                    }}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                                >
                                    <User size={17} />
                                    My Profile
                                </button>

                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
                                >
                                    <LogOut size={17} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
}
