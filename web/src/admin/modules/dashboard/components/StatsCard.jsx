
import { ArrowUpRight } from "lucide-react";

export default function StatsCard({
    title,
    value = 0,
    description,
    icon: Icon,
}) {
    const formattedValue = Number(value).toLocaleString();

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                    {title}
                </p>

                {Icon && (
                    <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                        <Icon size={20} />
                    </div>
                )}
            </div>

            <div className="mt-4 flex items-end justify-between">
                <h3 className="text-3xl font-bold text-gray-900">
                    {formattedValue}
                </h3>

                <ArrowUpRight
                    className="text-gray-400"
                    size={18}
                />
            </div>

            {description && (
                <p className="mt-2 text-xs text-gray-500">
                    {description}
                </p>
            )}
        </div>
    );
}
