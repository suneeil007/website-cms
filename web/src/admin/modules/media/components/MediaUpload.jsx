
import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Upload,
    X,
    Image as ImageIcon,
    FileText,
    Loader2,
} from "lucide-react";

import { toast } from "sonner";

import { useUploadMedia } from "../hooks/useMedia";

// ==========================================
// LOCAL PREVIEW
// ==========================================

function LocalPreview({ file }) {
    const [url, setUrl] = useState(null);

    useEffect(() => {
        if (!file.type.startsWith("image/")) {
            return;
        }

        const objectUrl = URL.createObjectURL(file);

        setUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    if (!url) {
        return <FileText className="h-7 w-7 text-muted-foreground" />;
    }

    return (
        <img
            src={url}
            alt={file.name}
            className="h-full w-full object-cover"
        />
    );
}

// ==========================================
// HELPERS
// ==========================================

function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} Bytes`;

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(2)} KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

// ==========================================
// COMPONENT
// ==========================================

export default function MediaUpload({
    onUploaded,
}) {
    const inputRef = useRef(null);

    const [files, setFiles] = useState([]);
    const [dragging, setDragging] = useState(false);

    const uploadMutation = useUploadMedia();

    const uploading = uploadMutation.isPending;

    const addFiles = (selectedFiles) => {
        if (uploading) return;

        const incoming = Array.from(selectedFiles);

        const valid = incoming.filter((file) => {
            const duplicate = files.some(
                (existing) =>
                    existing.name === file.name &&
                    existing.size === file.size &&
                    existing.lastModified === file.lastModified
            );

            if (duplicate) {
                toast.error(`${file.name} is already selected.`);
                return false;
            }

            return true;
        });

        if (valid.length) {
            setFiles((previous) => [
                ...previous,
                ...valid,
            ]);
        }
    };

    const removeFile = (index) => {
        setFiles((previous) =>
            previous.filter((_, i) => i !== index)
        );
    };

    const handleUpload = async () => {
        if (!files.length || uploading) return;

        try {
            const uploaded = await uploadMutation.mutateAsync(files);

            setFiles([]);

            toast.success(
                `${uploaded.length} file(s) uploaded successfully.`
            );

            onUploaded?.(uploaded);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Media upload failed."
            );
        }
    };

    return (
        <div className="space-y-4">

            {/* Dropzone */}

            <div
                onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={(event) => {
                    event.preventDefault();
                    setDragging(false);
                }}
                onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    addFiles(event.dataTransfer.files);
                }}
                onClick={() => inputRef.current?.click()}
                className={`
                    flex cursor-pointer flex-col items-center
                    justify-center rounded-xl border-2
                    border-dashed p-8 text-center transition

                    ${
                        dragging
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                    }

                    ${uploading ? "pointer-events-none opacity-50" : ""}
                `}
            >
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    disabled={uploading}
                    onChange={(event) => {
                        addFiles(event.target.files);
                        event.target.value = "";
                    }}
                    className="hidden"
                />

                <div className="mb-3 rounded-full bg-primary/10 p-4">
                    <Upload className="h-7 w-7 text-primary" />
                </div>

                <h3 className="font-semibold">
                    Drag and drop files here
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                    Or click to browse your computer
                </p>

                <p className="mt-3 text-xs text-muted-foreground">
                    The server validates supported file types and upload limits.
                </p>
            </div>

            {/* Selected Files */}

            {files.length > 0 && (
                <div className="space-y-3">

                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">
                            Selected Files ({files.length})
                        </h3>

                        <button
                            type="button"
                            disabled={uploading}
                            onClick={() => setFiles([])}
                            className="text-xs text-destructive hover:underline"
                        >
                            Clear all
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

                        {files.map((file, index) => (
                            <div
                                key={`${file.name}-${file.lastModified}-${index}`}
                                className="flex min-w-0 items-center gap-3 rounded-lg border p-3"
                            >
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                                    {file.type.startsWith("image/") ? (
                                        <LocalPreview file={file} />
                                    ) : (
                                        <FileText className="h-7 w-7 text-muted-foreground" />
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        {file.name}
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        {formatSize(file.size)}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    disabled={uploading}
                                    onClick={() => removeFile(index)}
                                    className="rounded-md p-1 hover:bg-muted disabled:opacity-50"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}

                    </div>

                    <div className="flex items-center justify-between border-t pt-4">

                        <span className="text-sm text-muted-foreground">
                            {files.length} file(s) ready
                        </span>

                        <button
                            type="button"
                            onClick={handleUpload}
                            disabled={uploading}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4" />
                                    Upload Files
                                </>
                            )}
                        </button>

                    </div>

                </div>
            )}
        </div>
    );
}
