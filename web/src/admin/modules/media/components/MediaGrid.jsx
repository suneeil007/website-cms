
import {
    Image as ImageIcon,
} from "lucide-react";

import MediaCard from "./MediaCard";

export default function MediaGrid({
    items = [],
    loading = false,
    selectedMedia,
    onSelect,
    onDetails,
}) {
    if (loading && !items.length) {
        return (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 10 }).map((_, index) => (
                    <div
                        key={index}
                        className="animate-pulse overflow-hidden rounded-xl border"
                    >
                        <div className="aspect-square bg-muted" />

                        <div className="space-y-2 p-3">
                            <div className="h-3 w-3/4 rounded bg-muted" />
                            <div className="h-3 w-1/2 rounded bg-muted" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!items.length) {
        return (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed text-center">
                <div className="mb-4 rounded-full bg-muted p-5">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>

                <h3 className="font-semibold">
                    No media found
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                    Upload files or change your search filters.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((media) => (
                <MediaCard
                    key={media.uuid}
                    media={media}
                    selected={selectedMedia?.uuid === media.uuid}
                    onClick={onSelect}
                    onMenu={onDetails}
                />
            ))}
        </div>
    );
}
