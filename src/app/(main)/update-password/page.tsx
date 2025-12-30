'use client'

import { updatePassword } from '@/app/(main)/auth/actions'
import { AuthLayout, LabelInputContainer, BottomGradient } from "@/components/ui/auth-components";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useSearchParams } from 'next/navigation'
import { toast } from "sonner";
import { useEffect, useRef } from "react";

export default function UpdatePasswordPage() {
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
        <AuthLayout title="New Password" subtitle="Enter your new password below">
            <form className="space-y-6">
                <div>
                    <LabelInputContainer>
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20"
                        />
                    </LabelInputContainer>
                </div>

                <button
                    formAction={updatePassword}
                    className="group/btn relative block h-11 w-full rounded-lg bg-gradient-to-br from-white to-neutral-200 text-black font-bold shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    Update Password
                    <BottomGradient />
                </button>
            </form>
        </AuthLayout>
    )
}
