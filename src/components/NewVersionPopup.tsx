'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { LATEST_VERSION } from '@/lib/changelog';
import { SparklesIcon } from '@/components/SparklesIcon';

export function NewVersionPopup() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const lastSeenVersion = localStorage.getItem('last_seen_version');
        if (lastSeenVersion !== LATEST_VERSION) {
            // Delay slightly to not overwhelm user on load
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="bg-neutral-900 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl relative"
                    >
                        <button
                            onClick={handleDismiss}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="w-20 h-20 bg-gradient-to-br from-black/12 to-black/12 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <SparklesIcon className="w-20 h-20 text-white" loop />
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2">New version is here!</h3>
                        <p className="text-neutral-400 mb-8">
                            Version <span className="text-white font-mono font-semibold">{LATEST_VERSION}</span> is now live. <br />
                            Check out the latest features and improvements.
                        </p>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={handleDismiss}
                                className="px-6 py-3 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition-colors font-medium"
                            >
                                Dismiss
                            </button>
                            <Link
                                href="/changelog"
                                onClick={handleViewChangelog}
                                className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-colors flex items-center gap-2"
                            >
                                View Changelog
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
