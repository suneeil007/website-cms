
import { Search } from "lucide-react";

export default function PageSeoForm({ values, onChange }) {
    const updateField = (field, value) => {
        onChange({
            ...values,
            [field]: value,
        });
    };

    return (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-5 flex items-center gap-2">
                <Search size={18} className="text-gray-500" />
                <div>
                    <h3 className="font-semibold text-gray-900">
                        Search Engine Optimization
                    </h3>
                    <p className="text-xs text-gray-500">
                        Configure how this page appears in search results.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        SEO Title
                    </label>

                    <input
                        type="text"
                        maxLength={200}
                        value={values.seoTitle || ""}
                        onChange={(event) =>
                            updateField("seoTitle", event.target.value)
                        }
                        placeholder="Enter SEO title"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <p className="mt-1 text-xs text-gray-400">
                        {(values.seoTitle || "").length}/200 characters
                    </p>
                </div>

                <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        SEO Description
                    </label>

                    <textarea
                        rows={4}
                        maxLength={320}
                        value={values.seoDescription || ""}
                        onChange={(event) =>
                            updateField("seoDescription", event.target.value)
                        }
                        placeholder="Write a short search description..."
                        className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <p className="mt-1 text-xs text-gray-400">
                        {(values.seoDescription || "").length}/320 characters
                    </p>
                </div>
            </div>
        </section>
    );
}
