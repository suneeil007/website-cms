
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    FileText,
    Newspaper,
    FolderTree,
    Image,
    Users,
    ShieldCheck,
    Settings,
    Globe,
    ChevronLeft,
    X,
    PanelLeftClose,
} from "lucide-react";

const navigation = [
    {
        title: "MAIN",
        items: [
            {
                label: "Dashboard",
                path: "/admin/dashboard",
                icon: LayoutDashboard,
            },
        ],
    },
    {
        title: "CONTENT MANAGEMENT",
        items: [
            {
                label: "Pages",
                path: "/admin/pages",
                icon: FileText,
            },
            {
                label: "News",
                path: "/admin/news",
                icon: Newspaper,
            },
            {
                label: "Categories",
                path: "/admin/categories",
                icon: FolderTree,
            },
            {
                label: "Media Library",
                path: "/admin/media",
                icon: Image,
            },
        ],
    },
    {
        title: "USER MANAGEMENT",
        items: [
            {
                label: "Users",
                path: "/admin/users",
                icon: Users,
            },
            {
                label: "Roles & Permissions",
                path: "/admin/roles",
                icon: ShieldCheck,
            },
        ],
    },
    {
        title: "SYSTEM",
        items: [
            {
                label: "Settings",
                path: "/admin/settings",
                icon: Settings,
            },
        ],
    },
];

export default function AdminSidebar({
    open,
    onClose,
    collapsed,
    onToggleCollapse,
}) {
    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 flex flex-col
                    bg-[#111827] text-white
                    transition-all duration-300
                    ${collapsed ? "lg:w-[80px]" : "lg:w-[260px]"}
                    w-[260px]
                    ${open ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0
                `}
            >
                {/* Brand */}
                <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-5">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-600">
                            <Globe size={21} />
                        </div>

                        {!collapsed && (
                            <div className="min-w-0">
                                <h2 className="text-sm font-bold tracking-wide">
                                    WEBSITE CMS
                                </h2>
                                <p className="text-[10px] text-gray-400">
                                    Administration
                                </p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-gray-400 hover:bg-white/10 lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
                    {navigation.map((group) => (
                        <div key={group.title}>
                            {!collapsed && (
                                <p className="mb-3 px-3 text-[10px] font-bold tracking-[1.5px] text-gray-500">
                                    {group.title}
                                </p>
                            )}

                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            onClick={onClose}
                                            title={collapsed ? item.label : ""}
                                            className={({ isActive }) => `
                                                flex items-center gap-3 rounded-lg px-3 py-2.5
                                                text-[13px] font-medium transition-colors
                                                ${
                                                    isActive
                                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-950/20"
                                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                                }
                                                ${collapsed ? "justify-center" : ""}
                                            `}
                                        >
                                            <Icon size={19} className="shrink-0" />

                                            {!collapsed && (
                                                <span>{item.label}</span>
                                            )}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="border-t border-white/10 p-3">
                    <button
                        onClick={onToggleCollapse}
                        className="hidden w-full items-center justify-center gap-2 rounded-lg p-2 text-xs text-gray-400 hover:bg-white/5 hover:text-white lg:flex"
                    >
                        {collapsed ? (
                            <PanelLeftClose size={18} />
                        ) : (
                            <>
                                <ChevronLeft size={17} />
                                Collapse sidebar
                            </>
                        )}
                    </button>

                    {!collapsed && (
                        <div className="mt-2 rounded-lg bg-white/5 p-3">
                            <p className="text-xs font-semibold">
                                Website CMS
                            </p>
                            <p className="mt-1 text-[10px] text-gray-500">
                                Version 1.0.0
                            </p>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
