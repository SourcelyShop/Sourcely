'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent')
        if (consent === null) {
            const timer = setTimeout(() => setIsVisible(true), 1000)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'true')
        window.dispatchEvent(new Event('cookie-consent-update'))
        setIsVisible(false)
    }

    const handleDecline = () => {
        localStorage.setItem('cookie-consent', 'false')
        window.dispatchEvent(new Event('cookie-consent-update'))
        setIsVisible(false)
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={cn(
                        "fixed bottom-8 left-0 right-0 z-50 mx-auto w-full max-w-3xl px-4",
                    )}
                >
                    <div
                        className={cn(
                            "flex flex-col items-center justify-between gap-4 rounded-3xl p-4 md:flex-row md:px-6 md:py-3",
                            "bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md",
                            "shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
                        )}
                    >
                        <div className="text-sm text-neutral-600 dark:text-neutral-300 text-center md:text-left">
                            <p>
                                We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.{' '}
                                <Link href="/legal/privacy" className="underline hover:text-black dark:hover:text-white transition-colors">
                                    Learn more
                                </Link>
                            </p>
                        </div>
                        <div className="flex gap-3 shrink-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDecline}
                                className="hover:bg-red-100 dark:hover:bg-red-900/30 text-neutral-600 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-colors"
                            >
                                Decline
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleAccept}
                                className="rounded-full bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                            >
                                Accept
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
