
import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

export default function MediaPagination({
    pagination,
    onPageChange,
}) {
    if (!pagination) return null;

    const {
        page,
        last_page,
        total,
        per_page,
    } = pagination;

    const start = total === 0
        ? 0
        : (page - 1) * per_page + 1;

    const end = Math.min(
        page * per_page,
        total
    );

    return (
        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm text-muted-foreground">
                Showing {start}–{end} of {total} files
            </p>

            <div className="flex items-center gap-2">

                <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                    className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </button>

                <span className="px-2 text-sm">
                    {page} / {last_page}
                </span>

                <button
                    type="button"
                    disabled={page >= last_page}
                    onClick={() => onPageChange(page + 1)}
                    className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </button>

            </div>
        </div>
    );
}
