
import { useState } from "react";

import {
    Search,
    Upload,
    X,
    Image as ImageIcon,
    FileText,
    Files,
} from "lucide-react";

import { useMedia } from "../hooks/useMedia";

import MediaGrid from "./MediaGrid";
import MediaPagination from "./MediaPagination";
import MediaUpload from "./MediaUpload";

export default function MediaPicker({
    open,
    onClose,
    onSelect,
    type = "all",
}) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [showUpload, setShowUpload] = useState(false);
    const [filter, setFilter] = useState(type);

    const {
        data,
        isLoading,
        isFetching,
    } = useMedia({
        page,
        per_page: 12,
        ...(filter !== "all" ? { type: filter } : {}),
        search: search || undefined,
        sortOrder: "desc",
    });

    const mediaItems = data?.items ?? [];
    const pagination = data?.pagination;

    if (!open) return null;

    const handleSearch = (value) => {
        setSearch(value);
        setPage(1);
        setSelectedMedia(null);
    };

    const handleFilter = (value) => {
        setFilter(value);
        setPage(1);
        setSelectedMedia(null);
    };

    const handleUploaded = (uploaded) => {
        if (!uploaded?.length) return;

        setShowUpload(false);
        setSearch("");
        setFilter("all");
        setPage(1);
        setSelectedMedia(uploaded[0]);
    };

    const handleClose = () => {
        setShowUpload(false);
        setSelectedMedia(null);
        onClose?.();
    };

    const handleSelect = () => {
        if (!selectedMedia) return;

        onSelect?.(selectedMedia);
        handleClose();
    };

    const filters = [
        { value: "all", label: "All Media", icon: Files },
        { value: "image", label: "Images", icon: ImageIcon },
        { value: "document", label: "Documents", icon: FileText },
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={handleClose}
        >
            <div
                className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-background shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold">
                            Select Media
                        </h2>

                        <p className="text-sm text-muted-foreground">
                            Select an existing file or upload new media.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-lg p-2 hover:bg-muted"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="space-y-4 border-b p-4">
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    handleSearch(event.target.value)
                                }
                                placeholder="Search files..."
                                className="h-10 w-full rounded-lg border bg-background pl-10 pr-4 text-sm outline-none focus:border-primary"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setShowUpload((previous) => !previous)
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                        >
                            {showUpload ? (
                                <>
                                    <X className="h-4 w-4" />
                                    Close Upload
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4" />
                                    Upload Files
                                </>
                            )}
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2">
                        {filters.map((item) => {
                            const Icon = item.icon;
                            const active = filter === item.value;

                            return (
                                <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => handleFilter(item.value)}
                                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                                        active
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border hover:bg-muted"
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Upload Panel */}
                {showUpload && (
                    <div className="border-b bg-muted/20 p-5">
                        <div className="mb-4 flex items-center gap-2">
                            <Upload className="h-5 w-5 text-primary" />

                            <h3 className="font-semibold">
                                Upload New Media
                            </h3>
                        </div>

                        <MediaUpload onUploaded={handleUploaded} />
                    </div>
                )}

                {/* Media Content */}
                <div className="min-h-0 flex-1 overflow-y-auto p-5">
                    {isFetching && !isLoading && (
                        <p className="mb-3 text-xs text-muted-foreground">
                            Refreshing media library...
                        </p>
                    )}

                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Files className="h-4 w-4 text-muted-foreground" />

                            <span className="text-sm font-medium">
                                {filters.find((item) => item.value === filter)?.label}
                            </span>
                        </div>

                        <span className="text-xs text-muted-foreground">
                            {pagination?.total ?? mediaItems.length} files
                        </span>
                    </div>

                    <MediaGrid
                        items={mediaItems}
                        loading={isLoading}
                        selectedMedia={selectedMedia}
                        onSelect={setSelectedMedia}
                    />

                    {pagination && (
                        <div className="mt-6">
                            <MediaPagination
                                pagination={pagination}
                                onPageChange={(nextPage) => {
                                    setPage(nextPage);
                                    setSelectedMedia(null);
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex flex-col gap-3 border-t bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        {selectedMedia ? (
                            <>
                                <p className="text-xs text-muted-foreground">
                                    Selected file
                                </p>

                                <p className="truncate text-sm font-medium">
                                    {selectedMedia.originalName}
                                </p>
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No file selected
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleSelect}
                            disabled={!selectedMedia}
                            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Select Media
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
