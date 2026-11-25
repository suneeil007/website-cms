
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen">

            {/* Left branding section */}
            <div className="hidden w-1/2 flex-col justify-between bg-slate-950 p-12 text-white lg:flex">

                <div>
                    <h1 className="text-3xl font-bold">
                        Website CMS
                    </h1>

                    <p className="mt-2 text-sm text-slate-400">
                        Content Management System
                    </p>
                </div>

                <div>
                    <h2 className="max-w-lg text-4xl font-bold leading-tight">
                        Manage your digital content from one powerful dashboard.
                    </h2>

                    <p className="mt-5 max-w-md text-slate-400">
                        Securely manage pages, news, media, users,
                        categories and permissions.
                    </p>
                </div>

                <p className="text-sm text-slate-500">
                    © {new Date().getFullYear()} Website CMS
                </p>

            </div>

            {/* Login section */}
            <div className="flex w-full items-center justify-center bg-gray-50 px-6 py-12 lg:w-1/2">

                <div className="w-full max-w-md">

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Welcome back
                        </h2>

                        <p className="mt-2 text-gray-500">
                            Sign in to access your admin dashboard.
                        </p>
                    </div>

                    <LoginForm />

                    <p className="mt-8 text-center text-sm text-gray-400">
                        Secure Administrator Access
                    </p>

                </div>

            </div>

        </div>
    );
}
