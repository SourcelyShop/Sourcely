'use client'

import { login } from '@/app/(main)/auth/actions'
import React, { useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthLayout, LabelInputContainer, BottomGradient } from "@/components/ui/auth-components";

export default function LoginPage() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')
    const shownErrorRef = useRef<string | null>(null)

    useEffect(() => {
        if (error && shownErrorRef.current !== error) {
            toast.error(error)
            shownErrorRef.current = error
        }
    }, [error])

    return (
        <AuthLayout title="Welcome Back" subtitle="Sign in to your account to continue">
            <form className="space-y-6">
                <div>
                    <LabelInputContainer>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            name='email'
                            placeholder="you@example.com"
                            type="email"
                            required
                            className="bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20"
                        />
                    </LabelInputContainer>
                </div>

                <div>
                    <LabelInputContainer className="mb-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link href="/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            name='password'
                            placeholder="••••••••"
                            type="password"
                            required
                            className="bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20"
                        />
                    </LabelInputContainer>
                </div>

                <button
                    formAction={login}
                    className="group/btn relative block h-11 w-full rounded-lg bg-gradient-to-br from-white to-neutral-200 text-black font-bold shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] hover:scale-[1.02] active:scale-[0.98] transition-all"
                    type="submit"
                >
                    Sign In
                    <BottomGradient />
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-neutral-400">
                Don't have an account?{' '}
                <Link href="/signup" className="text-white hover:text-primary font-medium transition-colors">
                    Sign up
                </Link>
            </div>
        </AuthLayout>
    )
}