
import { useState } from "react";
import {
    useNavigate,
    useLocation,
} from "react-router-dom";

import {
    Eye,
    EyeOff,
    Lock,
    Mail,
} from "lucide-react";

import useAuth from "../hooks/useAuth";

export default function LoginForm() {
    const navigate = useNavigate();
    const location = useLocation();

    const { login, error, clearError } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        clearError();
        setLoading(true);

        try {
            const result = await login({
                email: email.trim(),
                password,
            });

            if (result.success) {
                const from = location.state?.from;

                navigate(
                    from
                        ? {
                            pathname: from.pathname,
                            search: from.search || "",
                            hash: from.hash || "",
                        }
                        : "/admin/dashboard",
                    { replace: true }
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">

            {error && (
                <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
                >
                    {error}
                </div>
            )}

            {/* Email */}
            <div>
                <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    Email Address
                </label>

                <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) clearError();
                        }}
                        placeholder="admin@example.com"
                        required
                        autoComplete="username"
                        disabled={loading}
                        className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-4 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                    />
                </div>
            </div>

            {/* Password */}
            <div>
                <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    Password
                </label>

                <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (error) clearError();
                        }}
                        placeholder="Enter your password"
                        required
                        autoComplete="current-password"
                        disabled={loading}
                        className="w-full rounded-lg border border-gray-300 py-3 pl-11 pr-12 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        disabled={loading}
                        aria-label={
                            showPassword
                                ? "Hide password"
                                : "Show password"
                        }
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
                    >
                        {showPassword
                            ? <EyeOff size={20} />
                            : <Eye size={20} />
                        }
                    </button>
                </div>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={loading || !email.trim() || !password}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading ? (
                    <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Signing in...
                    </>
                ) : (
                    "Sign In"
                )}
            </button>

        </form>
    );
}
