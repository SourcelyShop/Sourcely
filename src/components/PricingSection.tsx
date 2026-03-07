"use client";
import React, { useState } from "react";
import { Check, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

const plans = [
    {
        name: "Premium Creator",
        description: "For serious creators looking to maximize sales and build their brand.",
        monthlyPrice: 5,
        yearlyPrice: 4,
        features: ["Profile page Customization", "Custom profile link", "Animated profile banner", "Monthly Asset Boosting credits", "Verified Premium Badge"],
        highlight: true,
    },
];

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// ... existing imports

interface PricingSectionProps {
    isPremium?: boolean;
}

export function PricingSection({ isPremium = false }: PricingSectionProps) {
    const [isAnnual, setIsAnnual] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubscribe = async () => {
        if (isPremium) return;

        try {
            setIsLoading(true);
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    interval: isAnnual ? 'year' : 'month',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error("Please login to subscribe");
                    router.push('/login?next=/premium');
                    return;
                }
                throw new Error(data.error || 'Failed to start subscription');
            }

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">

            {/* Header */}
            <div className="text-center mb-12 flex flex-col items-center">
                <h3 className="relative z-10 text-4xl md:text-5xl font-bold text-white tracking-tight max-w-2xl mx-auto">
                    Invest in your store's success
                </h3>

                {/* Toggle */}
                <div className="flex justify-center mt-8">
                    <div className="bg-neutral-900/50 backdrop-blur-md border border-white/10 p-1 rounded-full flex items-center relative">
                        <button
                            onClick={() => setIsAnnual(false)}
                            className={cn(
                                "px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 relative",
                                !isAnnual ? "text-black" : "text-neutral-400 hover:text-white"
                            )}
                        >
                            <span className="relative z-10">Monthly</span>
                            {!isAnnual && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute inset-0 bg-white rounded-full"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </button>
                        <button
                            onClick={() => setIsAnnual(true)}
                            className={cn(
                                "px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 relative",
                                isAnnual ? "text-black" : "text-neutral-400 hover:text-white"
                            )}
                        >
                            <span className="relative z-10 flex items-center gap-1">
                                Yearly <span className="text-xs opacity-80">(Save 20%)</span>
                            </span>
                            {isAnnual && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute inset-0 bg-white rounded-full"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="flex justify-center mt-8 relative">
                {plans.map((plan) => (
                    <motion.div
                        key={plan.name}
                        whileHover={{ scale: 1.02, y: -5 }}
                        className={cn(
                            "relative rounded-2xl p-8 md:p-10 flex flex-col transition-all duration-300 w-full max-w-md z-10",
                            plan.highlight
                                ? "glass-card border-white/20 shadow-2xl shadow-black/50"
                                : "bg-neutral-900/40 border border-white/5 hover:border-white/10 hover:bg-neutral-900/60"
                        )}
                    >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                            {/* <motion.div
                                animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Crown className="w-12 h-12 text-white" />
                            </motion.div> */}
                        </div>

                        <div className="mb-8 mt-4">
                            <h4 className="text-2xl font-serif font-bold text-white mb-2">
                                {plan.name}
                            </h4>
                            <p className="text-neutral-400 text-sm leading-relaxed h-12">
                                {plan.description}
                            </p>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-bold text-white">
                                    ${isAnnual ? plan.yearlyPrice * 12 : plan.monthlyPrice}
                                </span>
                                <span className="text-neutral-400">/{isAnnual ? 'Year' : 'Month'}</span>
                            </div>
                            {isAnnual && (
                                <p className="text-sm text-neutral-500 mt-2">
                                    (${plan.yearlyPrice}/month billed annually)
                                </p>
                            )}
                        </div>

                        <div className="mb-10 flex-1">
                            <p className="text-white font-medium mb-6 uppercase tracking-wider text-sm">Everything included:</p>
                            <ul className="space-y-4">
                                {plan.features.map((feature, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-start gap-4 text-base text-neutral-300"
                                    >
                                        <div className="p-1 rounded-full bg-white/10 mt-0.5 border border-white/10">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                        <span>{feature}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>

                        <motion.button
                            whileHover={!isPremium ? { scale: 1.02 } : {}}
                            whileTap={!isPremium ? { scale: 0.98 } : {}}
                            onClick={handleSubscribe}
                            disabled={isLoading || isPremium}
                            className={cn(
                                "w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 relative overflow-hidden group",
                                isPremium
                                    ? "bg-neutral-800 text-neutral-400 cursor-not-allowed border border-white/5"
                                    : plan.highlight
                                        ? "bg-white text-black hover:bg-neutral-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                        : "bg-white/10 text-white hover:bg-neutral-800"
                            )}
                        >
                            <span className={cn("relative z-10 flex items-center justify-center gap-2", isLoading ? "opacity-0" : "opacity-100")}>
                                {isPremium ? "Current Plan" : "Subscribe"}
                            </span>
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                </div>
                            )}
                        </motion.button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
