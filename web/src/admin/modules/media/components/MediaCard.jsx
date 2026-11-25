
import {
    Check,
    FileText,
    Image as ImageIcon,
    MoreVertical,
} from "lucide-react";

import MediaPreview from "./MediaPreview";

function formatFileSize(bytes) {
    const size = Number(bytes);

    if (!Number.isFinite(size) || size <= 0) {
        return "0 Bytes";
    }

    const units = ["Bytes", "KB", "MB", "GB"];

    const index = Math.min(
        Math.floor(Math.log(size) / Math.log(1024)),
        units.length - 1
    );

    return `${(size / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
}

export default function MediaCard({
    media,
    selected = false,
    onClick,
    onMenu,
}) {
    const isImage = media.mimeType?.startsWith("image/");

    return (
        <div
            onClick={() => onClick?.(media)}
            className={`
                group relative cursor-pointer overflow-hidden
                rounded-xl border bg-card transition-all

                ${
                    selected
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                }
            `}
        >
            {/* Preview */}

            <div className="relative aspect-square overflow-hidden bg-muted">
                <MediaPreview
                    media={media}
                    className="h-full w-full"
                />

                {/* Selection */}

                {selected && (
                    <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-4 w-4" />
                    </div>
                )}

                {/* Menu */}

                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation();
                        onMenu?.(media);
                    }}
                    className="absolute right-2 top-2 rounded-md bg-background/90 p-1.5 opacity-0 shadow transition group-hover:opacity-100"
                    aria-label="Media options"
                >
                    <MoreVertical className="h-4 w-4" />
                </button>
            </div>

            {/* Information */}

            <div className="space-y-1 p-3">
                <div className="flex items-center gap-2">
                    {isImage ? (
                        <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}

                    <p
                        title={media.originalName}
                        className="truncate text-sm font-medium"
                    >
                        {media.originalName}
                    </p>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                        {formatFileSize(media.size)}
                    </span>

                    <span className="text-xs text-muted-foreground">
                        {media.usageCount ?? 0} uses
                    </span>
                </div>
            </div>
        </div>
    );
}
