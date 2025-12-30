import { AuthLayout } from "@/components/ui/auth-components";
import { MailCheck } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
    return (
        <AuthLayout title="Check your inbox" subtitle="We've sent you a verification link">
            <div className="flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse" />
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-full flex items-center justify-center border border-green-500/20 relative backdrop-blur-sm">
                        <MailCheck className="w-10 h-10 text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]" />
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-neutral-300">
                        Click the link in the email we sent to verify your account.
                    </p>
                    <p className="text-sm text-neutral-500">
                        If you don't see it, check your spam folder.
                    </p>
                </div>

                <div className="pt-4 w-full">
                    <Link
                        href="/login"
                        className="block w-full py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg border border-white/10 transition-colors"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </AuthLayout>
    )
}
