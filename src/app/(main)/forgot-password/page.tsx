'use client'

import { forgotPassword } from '@/app/(main)/auth/actions'
import { AuthLayout, LabelInputContainer, BottomGradient } from "@/components/ui/auth-components";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { toast } from "sonner";
import { useEffect, useRef } from "react";

export default function ForgotPasswordPage() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')
    const message = searchParams.get('message')
    const shownErrorRef = useRef<string | null>(null)
    const shownMessageRef = useRef<string | null>(null)

    useEffect(() => {
        if (error && shownErrorRef.current !== error) {
            toast.error(error)
            shownErrorRef.current = error
        }
        if (message === 'check_email' && shownMessageRef.current !== message) {
            toast.success('Reset link sent! Please check your email.')
            shownMessageRef.current = message
        }
    }, [error, message])

    return (
        <AuthLayout title="Reset Password" subtitle="Enter your email to receive a reset link">
            <form className="space-y-6">
                <div>
                    <LabelInputContainer>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="you@example.com"
                            className="bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20"
                        />
                    </LabelInputContainer>
                </div>

                <button
                    formAction={forgotPassword}
                    className="group/btn relative block h-11 w-full rounded-lg bg-gradient-to-br from-white to-neutral-200 text-black font-bold shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    Send Reset Link
                    <BottomGradient />
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-neutral-400">
                Remember your password?{' '}
                <Link href="/login" className="text-white hover:text-primary font-medium transition-colors">
                    Sign in
                </Link>
            </div>
        </AuthLayout>
    )
}
