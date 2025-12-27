'use client'

import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";


export const LabelInputContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={cn("flex w-full flex-col space-y-2", className)}>
            {children}
        </div>
    );
};

export const BottomGradient = () => {
    return (
        <>
            <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
            <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
        </>
    );
};

export const AuthLayout = ({ children, title, subtitle }: { children: React.ReactNode, title: string, subtitle?: string }) => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black via-neutral-900 to-black -z-20" />
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />

            <div className="w-full max-w-md bg-black/40 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10 relative z-10">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-neutral-400 mt-2 text-sm">
                            {subtitle}
                        </p>
                    )}
                </div>
                {children}
            </div>

            <div className="absolute bottom-8 text-center text-xs text-neutral-500">
                <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <span className="mx-2">•</span>
                <Link href="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
        </div>
    )
}
