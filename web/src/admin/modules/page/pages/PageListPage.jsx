
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import usePages from "../hooks/usePages";
import useDeletePage from "../hooks/useDeletePage";
import PageTable from "../components/PageTable";
import PageFilters from "../components/PageFilters";

function normalizeListResponse(response) {
    if (Array.isArray(response)) {
        return {
            pages: response,
            meta: {},
        };
    }

    const pages =
        response?.data ??
        response?.pages ??
        response?.items ??
        [];

    return {
        pages: Array.isArray(pages) ? pages : [],
        meta: response?.meta ?? response?.pagination ?? {},
    };
}

export default function PageListPage() {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const perPage = 15;

    const filters = useMemo(
        () => ({
            page,
            per_page: perPage,
            ...(search.trim() ? { search: search.trim() } : {}),
            ...(status ? { status } : {}),
        }),
        [page, perPage, search, status]
    );

    const {
        data: response,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = usePages(filters);

    const deleteMutation = useDeletePage();

    const { pages, meta } = normalizeListResponse(response);

    const currentPage = Number(
        meta.current_page ?? meta.page ?? page
    );

    const totalPages = Number(
        meta.last_page ??
        meta.total_pages ??
        Math.max(1, Math.ceil(Number(meta.total ?? pages.length) / perPage))
    );

    const totalItems = Number(meta.total ?? pages.length);

    const handleReset = () => {
        setSearch("");
        setStatus("");
        setPage(1);
    };

    const handleDelete = async (selectedPage) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${selectedPage.title}"? This action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            await deleteMutation.mutateAsync(selectedPage.uuid);
        } catch {
            // Mutation hook displays the error notification.
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <FileText size={22} className="text-gray-700" />
                        <h1 className="text-2xl font-bold text-gray-900">
                            Pages
                        </h1>
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage your website pages and content.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/admin/pages/create")}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                    <Plus size={17} />
                    Create Page
                </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-500">
                    {totalItems} {totalItems === 1 ? "page" : "pages"} found
                </div>

                <button
                    type="button"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 sm:self-auto"
                >
                    <RefreshCw
                        size={15}
                        className={isFetching ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            <PageFilters
                search={search}
                status={status}
                onSearchChange={(value) => {
                    setSearch(value);
                    setPage(1);
                }}
                onStatusChange={(value) => {
                    setStatus(value);
                    setPage(1);
                }}
                onReset={handleReset}
            />

            {isError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-6">
                    <p className="font-medium text-red-700">
                        Failed to load pages.
                    </p>
                    <p className="mt-1 text-sm text-red-600">
                        {error?.response?.data?.message ||
                            error?.message ||
                            "Please try again."}
                    </p>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="mt-3 text-sm font-semibold text-red-700 underline"
                    >
                        Try again
                    </button>
                </div>
            ) : (
                <>
                    <PageTable
                        pages={pages}
                        isLoading={isLoading}
                        onEdit={(selectedPage) =>
                            navigate(`/admin/pages/${selectedPage.uuid}/edit`)
                        }
                        onDelete={handleDelete}
                    />

                    {!isLoading && pages.length > 0 && (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-gray-500">
                                Page {currentPage} of {totalPages}
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={currentPage <= 1 || isFetching}
                                    onClick={() =>
                                        setPage((previous) => Math.max(1, previous - 1))
                                    }
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>

                                <span className="px-2 text-sm text-gray-600">
                                    {currentPage} / {totalPages}
                                </span>

                                <button
                                    type="button"
                                    disabled={currentPage >= totalPages || isFetching}
                                    onClick={() =>
                                        setPage((previous) =>
                                            Math.min(totalPages, previous + 1)
                                        )
                                    }
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
