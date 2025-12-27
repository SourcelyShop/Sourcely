'use client'

import Link from 'next/link'
import { WavyBackground } from "@/components/ui/wavy-background";
import { FadeIn } from "@/components/ui/animations";
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-black">
            <div className="absolute inset-0 z-0">
                <WavyBackground className="max-w-4xl mx-auto pb-40" backgroundFill="#000000" />
            </div>

            <div className="relative z-10 px-4 text-center">
                <FadeIn>
                    <h1 className="text-9xl font-bold text-white mb-4 tracking-tighter drop-shadow-2xl opacity-90">
                        404
                    </h1>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
                        Lost in the Void
                    </h2>
                    <p className="text-lg text-neutral-400 max-w-md mx-auto mb-10 leading-relaxed">
                        The asset or page you are looking for has been moved, deleted, or never existed in this dimension.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/"
                            className="group px-8 py-4 bg-white text-black rounded-full font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2"
                        >
                            <Home className="w-5 h-5" />
                            Return Home
                        </Link>

                        <button
                            onClick={() => window.history.back()}
                            className="px-8 py-4 bg-white/5 text-white rounded-full font-medium text-lg border border-white/10 transition-all hover:bg-white/10 hover:scale-105 flex items-center gap-2 backdrop-blur-sm"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Go Back
                        </button>
                    </div>
                </FadeIn>
            </div>

            <div className="absolute bottom-10 text-neutral-600 text-sm">
                Sourcely Marketplace
            </div>
        </div>
    )
}
