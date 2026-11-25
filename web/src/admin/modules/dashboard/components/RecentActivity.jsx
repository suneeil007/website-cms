
import {
    FileText,
    Newspaper,
    Image,
    UserPlus,
    FolderTree,
    Activity,
} from "lucide-react";

const activityConfig = {
    PAGE: {
        icon: FileText,
        color: "bg-blue-50 text-blue-600",
    },
    NEWS: {
        icon: Newspaper,
        color: "bg-green-50 text-green-600",
    },
    MEDIA: {
        icon: Image,
        color: "bg-purple-50 text-purple-600",
    },
    USER: {
        icon: UserPlus,
        color: "bg-orange-50 text-orange-600",
    },
    CATEGORY: {
        icon: FolderTree,
        color: "bg-indigo-50 text-indigo-600",
    },
    DEFAULT: {
        icon: Activity,
        color: "bg-gray-50 text-gray-600",
    },
};

function formatTime(date) {
    if (!date) return "Recently";

    const timestamp = new Date(date);

    if (Number.isNaN(timestamp.getTime())) {
        return "Recently";
    }

    const diff = Math.max(
        0,
        Date.now() - timestamp.getTime()
    );

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return timestamp.toLocaleDateString();
}

export default function RecentActivity({ activities = [] }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4">
                <h3 className="text-sm font-bold text-gray-900">
                    Recent Activity
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                    Latest activity across your CMS
                </p>
            </div>

            {activities.length === 0 ? (
                <div className="flex min-h-48 flex-col items-center justify-center px-5 text-center">
                    <Activity className="mb-3 text-gray-300" size={30} />

                    <p className="text-sm font-medium text-gray-600">
                        No recent activity
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                        Activities will appear here when changes are made.
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {activities.map((activity, index) => {
                        const type = String(
                            activity.type ??
                            activity.module ??
                            activity.entityType ??
                            ""
                        ).toUpperCase();

                        const config =
                            activityConfig[type] ??
                            activityConfig.DEFAULT;

                        const Icon = config.icon;

                        return (
                            <div
                                key={activity.id ?? activity.uuid ?? index}
                                className="flex items-center gap-3 px-5 py-4"
                            >
                                <div
                                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${config.color}`}
                                >
                                    <Icon size={19} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-800">
                                        {activity.title ??
                                            activity.action ??
                                            "Activity"}
                                    </p>

                                    <p className="mt-1 truncate text-xs text-gray-500">
                                        {activity.description ??
                                            activity.message ??
                                            "A CMS activity occurred"}
                                    </p>
                                </div>

                                <span className="whitespace-nowrap text-[10px] text-gray-400">
                                    {formatTime(
                                        activity.createdAt ??
                                        activity.created_at ??
                                        activity.timestamp
                                    )}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
