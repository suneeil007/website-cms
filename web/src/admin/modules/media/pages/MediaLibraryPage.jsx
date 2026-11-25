
import { useState } from "react";

import {
    Upload,
    Search,
    RefreshCw,
    Images,
    FileText,
    Image as ImageIcon,
    X,
    Loader2,
} from "lucide-react";

import { useMedia } from "../hooks/useMedia";

import MediaUpload from "../components/MediaUpload";
import MediaGrid from "../components/MediaGrid";
import MediaDetails from "../components/MediaDetails";
import MediaPagination from "../components/MediaPagination";

// ==========================================
// PAGE
// ==========================================

export default function MediaLibraryPage() {
    const [search, setSearch] = useState("");
    const [type, setType] = useState("all");
    const [page, setPage] = useState(1);

    const [showUpload, setShowUpload] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);

    const params = {
        page,
        per_page: 20,
        sortOrder: "desc",
        ...(type !== "all" && { type }),
        ...(search.trim() && { search: search.trim() }),
    };

    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
    } = useMedia(params);

    const items = data?.items ?? [];
    const pagination = data?.pagination;

    const handleSearch = (value) => {
        setSearch(value);
        setPage(1);
    };

    const handleFilter = (value) => {
        setType(value);
        setPage(1);
        setSelectedMedia(null);
    };

    const handleUploaded = () => {
        setShowUpload(false);
        setPage(1);
    };

    const handleDeleted = () => {
        setSelectedMedia(null);
    };

    return (
        <div className="space-y-6">

            {/* Page Header */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Media Library
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage images, documents and other uploaded files.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">

                    <button
                        type="button"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                isFetching ? "animate-spin" : ""
                            }`}
                        />

                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowUpload((value) => !value)}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
                    >
                        {showUpload ? (
                            <X className="h-4 w-4" />
                        ) : (
                            <Upload className="h-4 w-4" />
                        )}

                        {showUpload ? "Close Upload" : "Upload Media"}
                    </button>

                </div>

            </div>

            {/* Upload Section */}

            {showUpload && (
                <section className="rounded-xl border bg-card p-5">
                    <div className="mb-4">
                        <h2 className="font-semibold">
                            Upload Files
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Select or drag files to upload to your library.
                        </p>
                    </div>

                    <MediaUpload
                        onUploaded={handleUploaded}
                    />
                </section>
            )}

            {/* Statistics */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                        <Images className="h-6 w-6 text-primary" />
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">
                            Total Files
                        </p>

                        <p className="text-xl font-bold">
                            {pagination?.total ?? 0}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
                    <div className="rounded-lg bg-blue-500/10 p-3">
                        <ImageIcon className="h-6 w-6 text-blue-500" />
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">
                            Images
                        </p>

                        <p className="text-xl font-bold">
                            {type === "image"
                                ? pagination?.total ?? 0
                                : "—"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border bg-card p-4">
                    <div className="rounded-lg bg-orange-500/10 p-3">
                        <FileText className="h-6 w-6 text-orange-500" />
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">
                            Documents
                        </p>

                        <p className="text-xl font-bold">
                            {type === "document"
                                ? pagination?.total ?? 0
                                : "—"}
                        </p>
                    </div>
                </div>

            </div>

            {/* Filters */}

            <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <input
                        value={search}
                        onChange={(event) => handleSearch(event.target.value)}
                        placeholder="Search media..."
                        className="w-full rounded-lg border bg-background py-2.5 pl-9 pr-9 text-sm outline-none focus:border-primary"
                    />

                    {search && (
                        <button
                            type="button"
                            onClick={() => handleSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">

                    {[
                        { value: "all", label: "All Media" },
                        { value: "image", label: "Images" },
                        { value: "document", label: "Documents" },
                    ].map((filter) => (
                        <button
                            key={filter.value}
                            type="button"
                            onClick={() => handleFilter(filter.value)}
                            className={`
                                rounded-lg border px-4 py-2 text-sm font-medium transition

                                ${
                                    type === filter.value
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "hover:bg-muted"
                                }
                            `}
                        >
                            {filter.label}
                        </button>
                    ))}

                </div>

            </div>

            {/* Media Grid */}

            <section className="space-y-4">

                <div className="flex items-center justify-between">
                    <h2 className="font-semibold">
                        Media Files
                    </h2>

                    {isFetching && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                </div>

                {isError ? (
                    <div className="rounded-xl border border-destructive/30 p-8 text-center">
                        <p className="font-medium text-destructive">
                            Unable to load media.
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                            {error?.response?.data?.message ||
                                error?.message ||
                                "Please try again."}
                        </p>

                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="mt-4 rounded-lg border px-4 py-2 text-sm"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <MediaGrid
                        items={items}
                        loading={isLoading}
                        selectedMedia={selectedMedia}
                        onSelect={(media) => {
                            setSelectedMedia(media.uuid);
                        }}
                        onDetails={(media) => {
                            setSelectedMedia(media.uuid);
                        }}
                    />
                )}

                {/* Pagination */}

                {!isError && (
                    <MediaPagination
                        pagination={pagination}
                        onPageChange={(nextPage) => {
                            setPage(nextPage);
                            setSelectedMedia(null);
                        }}
                    />
                )}

            </section>

            {/* Details Panel */}

            {selectedMedia && (
                <MediaDetails
                    uuid={selectedMedia}
                    onClose={() => setSelectedMedia(null)}
                    onDeleted={handleDeleted}
                />
            )}

        </div>
    );
}
