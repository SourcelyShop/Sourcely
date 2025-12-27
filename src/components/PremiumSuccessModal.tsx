'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Crown, ArrowRight } from 'lucide-react'
import confetti from 'canvas-confetti'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

export function PremiumSuccessModal() {
    const [isOpen, setIsOpen] = useState(false)
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        if (searchParams.get('success') === 'true') {
            setIsOpen(true)
            // Fire confetti
            const duration = 3 * 1000
            const animationEnd = Date.now() + duration
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 }

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now()

                if (timeLeft <= 0) {
                    return clearInterval(interval)
                }

                const particleCount = 50 * (timeLeft / duration)
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
                })
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
                })
            }, 250)

            // Clean up URL
            router.replace('/premium')
        }
    }, [searchParams, router])

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-neutral-900 border border-yellow-500/20 rounded-2xl p-8 shadow-2xl overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-yellow-500/10 blur-3xl -z-10" />

                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-neutral-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 to-yellow-600 flex items-center justify-center mb-6 shadow-lg shadow-yellow-500/20">
                                <Crown className="w-8 h-8 text-white fill-white" />
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">
                                Welcome to Premium!
                            </h2>
                            <p className="text-neutral-400 mb-8">
                                Thank you for subscribing. You now have access to exclusive features, including profile customization.
                            </p>

                            <div className="w-full space-y-3">
                                <Link
                                    href="/settings"
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-neutral-200 transition-colors"
                                >
                                    Customize Profile
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-3 text-neutral-400 hover:text-white transition-colors font-medium"
                                >
                                    Maybe later
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
