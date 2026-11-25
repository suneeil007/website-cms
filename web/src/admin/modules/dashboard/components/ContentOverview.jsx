
import {
    FileText,
    Newspaper,
    FolderTree,
    Image,
} from "lucide-react";

const contentConfig = [
    {
        key: "publishedPages",
        label: "Published Pages",
        icon: FileText,
        color: "text-blue-600",
        bg: "bg-blue-50",
        bar: "bg-blue-500",
    },
    {
        key: "newsArticles",
        label: "News Articles",
        icon: Newspaper,
        color: "text-green-600",
        bg: "bg-green-50",
        bar: "bg-green-500",
    },
    {
        key: "categories",
        label: "Categories",
        icon: FolderTree,
        color: "text-orange-600",
        bg: "bg-orange-50",
        bar: "bg-orange-500",
    },
    {
        key: "mediaFiles",
        label: "Media Files",
        icon: Image,
        color: "text-purple-600",
        bg: "bg-purple-50",
        bar: "bg-purple-500",
    },
];

export default function ContentOverview({
    statistics = {},
}) {
    const content = contentConfig.map((item) => ({
        ...item,
        count: Number(statistics[item.key] ?? 0),
    }));

    const maxCount = Math.max(
        ...content.map((item) => item.count),
        1
    );

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900">
                    Content Overview
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                    Summary of your website content
                </p>
            </div>

            <div className="space-y-6">
                {content.map((item) => {
                    const Icon = item.icon;

                    const percentage =
                        (item.count / maxCount) * 100;

                    return (
                        <div key={item.key}>
                            <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div
                                        className={`flex size-8 items-center justify-center rounded-lg ${item.bg} ${item.color}`}
                                    >
                                        <Icon size={16} />
                                    </div>

                                    <span className="text-xs font-medium text-gray-600">
                                        {item.label}
                                    </span>
                                </div>

                                <span className="text-sm font-bold text-gray-900">
                                    {item.count.toLocaleString()}
                                </span>
                            </div>

                            <div
                                className="h-1.5 overflow-hidden rounded-full bg-gray-100"
                                role="progressbar"
                                aria-valuenow={Math.round(percentage)}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={item.label}
                            >
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${item.bar}`}
                                    style={{
                                        width: `${percentage}%`,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
