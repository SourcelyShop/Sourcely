'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { LATEST_VERSION } from '@/lib/changelog';
import { SparklesIcon } from '@/components/SparklesIcon';

interface NewVersionPopupProps {
    enabled?: boolean;
}

export function NewVersionPopup({ enabled = true }: NewVersionPopupProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!enabled) return;

        const lastSeenVersion = localStorage.getItem('last_seen_version');
        if (lastSeenVersion !== LATEST_VERSION) {
            // Delay slightly to not overwhelm user on load
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [enabled]);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('last_seen_version', LATEST_VERSION);
    };

    const handleViewChangelog = () => {
        setIsVisible(false);
        localStorage.setItem('last_seen_version', LATEST_VERSION);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: -50, opacity: 0, x: "-50%" }}
                    animate={{ y: 0, opacity: 1, x: "-50%" }}
                    exit={{ y: -50, opacity: 0, x: "-50%" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="fixed top-6 left-1/2 z-[9999] w-[calc(100%-2rem)] max-w-fit"
                >
                    <div className="bg-neutral-900 border border-white/10 rounded-full px-4 py-2 shadow-2xl flex items-center gap-4 hover:border-white/20 transition-colors">
                        <div className="flex items-center gap-2.5">
                            <SparklesIcon className="w-4 h-4 text-white" loop />
                            <span className="text-sm font-medium text-white whitespace-nowrap">
                                Version <span className="font-mono text-primary">{LATEST_VERSION}</span> is now live!
                            </span>
                        </div>

                        <div className="w-px h-4 bg-white/10 hidden sm:block" />

                        <div className="flex items-center gap-2">
                            <Link
                                href="/changelog"
                                onClick={handleViewChangelog}
                                className="text-xs font-bold text-black bg-white hover:bg-neutral-200 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap flex items-center gap-1.5"
                            >
                                View Changelog
                                <ArrowRight className="w-3 h-3" />
                            </Link>

                            <button
                                onClick={handleDismiss}
                                className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
