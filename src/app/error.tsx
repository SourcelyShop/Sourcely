'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { WavyBackground } from "@/components/ui/wavy-background"
import { FadeIn } from "@/components/ui/animations"
import { Home, RefreshCcw, AlertTriangle } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-black">
            <div className="absolute inset-0 z-0">
                <WavyBackground className="max-w-4xl mx-auto pb-40" backgroundFill="#000000" />
            </div>

            <div className="relative z-10 px-4 text-center">
                <FadeIn>
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20 backdrop-blur-md">
                            <AlertTriangle className="w-12 h-12 text-red-500" />
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tighter drop-shadow-2xl opacity-90">
                        Something went wrong
                    </h1>
                    <h2 className="text-xl md:text-2xl font-medium text-neutral-300 mb-8 tracking-tight">
                        Don't worry, our team has been notified.
                    </h2>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={reset}
                            className="group px-8 py-4 bg-white text-black rounded-full font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2"
                        >
                            <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                            Try Again
                        </button>

                        <Link
                            href="/"
                            className="px-8 py-4 bg-white/5 text-white rounded-full font-medium text-lg border border-white/10 transition-all hover:bg-white/10 hover:scale-105 flex items-center gap-2 backdrop-blur-sm"
                        >
                            <Home className="w-5 h-5" />
                            Return Home
                        </Link>
                    </div>

                    {error.digest && (
                        <p className="mt-12 text-xs text-neutral-600 font-mono">
                            Error ID: {error.digest}
                        </p>
                    )}
                </FadeIn>
            </div>
        </div>
    )
}
