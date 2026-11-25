
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import PageStatusBadge from "./PageStatusBadge";

function formatDate(date) {
    if (!date) return "—";

    return new Intl.DateTimeFormat("en", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(new Date(date));
}

export default function PageTable({
    pages = [],
    isLoading,
    onEdit,
    onDelete,
}) {
    if (isLoading) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
                Loading pages...
            </div>
        );
    }

    if (!pages.length) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                <h3 className="font-semibold text-gray-900">
                    No pages found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                    Create your first page to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                    <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Page</th>
                            <th className="px-6 py-4 font-semibold">Slug</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold">Published</th>
                            <th className="px-6 py-4 text-right font-semibold">
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {pages.map((page) => (
                            <tr
                                key={page.uuid}
                                className="transition hover:bg-gray-50"
                            >
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">
                                        {page.title}
                                    </div>

                                    {page.excerpt && (
                                        <div className="mt-1 max-w-sm truncate text-xs text-gray-500">
                                            {page.excerpt}
                                        </div>
                                    )}
                                </td>

                                <td className="px-6 py-4 text-gray-600">
                                    /{page.slug}
                                </td>

                                <td className="px-6 py-4">
                                    <PageStatusBadge status={page.status} />
                                </td>

                                <td className="px-6 py-4 text-gray-600">
                                    {formatDate(page.publishedAt)}
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onEdit(page)}
                                            title="Edit page"
                                            className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                                        >
                                            <Edit size={16} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => onDelete(page)}
                                            title="Delete page"
                                            className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
