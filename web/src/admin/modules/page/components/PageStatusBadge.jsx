
const statusStyles = {
    DRAFT: "bg-gray-100 text-gray-700",
    PUBLISHED: "bg-green-100 text-green-700",
    ARCHIVED: "bg-amber-100 text-amber-700",
};

const statusLabels = {
    DRAFT: "Draft",
    PUBLISHED: "Published",
    ARCHIVED: "Archived",
};

export default function PageStatusBadge({ status }) {
    const normalizedStatus = String(status || "DRAFT").toUpperCase();

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                statusStyles[normalizedStatus] || statusStyles.DRAFT
            }`}
        >
            {statusLabels[normalizedStatus] || normalizedStatus}
        </span>
    );
}
