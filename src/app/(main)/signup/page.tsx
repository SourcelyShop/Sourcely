import { signup } from '@/app/(main)/auth/actions'
import Link from 'next/link'
import { AuthLayout, LabelInputContainer, BottomGradient } from "@/components/ui/auth-components";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
    return (
        <AuthLayout title="Create Account" subtitle="Join Sourcely today">
            <form className="space-y-6">
                <div>
                    <LabelInputContainer>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            placeholder="John Doe"
                            className="bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20"
                        />
                    </LabelInputContainer>
                </div>

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

                <div>
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="password">Password</Label>
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
                    formAction={signup}
                    className="group/btn relative block h-11 w-full rounded-lg bg-gradient-to-br from-white to-neutral-200 text-black font-bold shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    Create Account
                    <BottomGradient />
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-neutral-400">
                Already have an account?{' '}
                <Link href="/login" className="text-white hover:text-primary font-medium transition-colors">
                    Sign in
                </Link>
            </div>
        </AuthLayout>
    )
}
