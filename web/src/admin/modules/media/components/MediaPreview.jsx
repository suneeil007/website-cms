
import { useEffect, useState } from "react";

import {
    Image as ImageIcon,
    FileText,
    Loader2,
    AlertCircle,
} from "lucide-react";

import { downloadMedia } from "../api/mediaApi";

export default function MediaPreview({
    media,
    className = "",
    imageClassName = "h-full w-full object-cover",
}) {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const isImage = media?.mimeType?.startsWith("image/");

    useEffect(() => {
        let active = true;
        let objectUrl = null;

        async function loadPreview() {
            setPreviewUrl(null);
            setError(false);

            if (!media?.uuid || !isImage) {
                return;
            }

            setLoading(true);

            try {
                const blob = await downloadMedia(media.uuid);

                if (!active) return;

                objectUrl = URL.createObjectURL(blob);

                setPreviewUrl(objectUrl);
            } catch {
                if (active) {
                    setError(true);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadPreview();

        return () => {
            active = false;

            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [media?.uuid, isImage]);

    return (
        <div
            className={`relative flex items-center justify-center overflow-hidden bg-muted ${className}`}
        >
            {loading && (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            )}

            {!loading && previewUrl && !error && (
                <img
                    src={previewUrl}
                    alt={media?.altText || media?.originalName || "Media"}
                    className={imageClassName}
                />
            )}

            {!loading && (!isImage || error) && (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    {isImage ? (
                        <AlertCircle className="h-8 w-8" />
                    ) : media?.mimeType === "application/pdf" ? (
                        <FileText className="h-8 w-8" />
                    ) : (
                        <ImageIcon className="h-8 w-8" />
                    )}

                    <span className="text-xs">
                        {isImage ? "Preview unavailable" : "File"}
                    </span>
                </div>
            )}
        </div>
    );
}
