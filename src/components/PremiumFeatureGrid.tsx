"use client";
import React from "react";
import { motion } from "motion/react";
import { Paintbrush, Link as LinkIcon, Rocket, BadgeCheck } from "lucide-react";

export function PremiumFeatureGrid() {
    const features = [
        {
            title: "Profile Customization",
            description: "Stand out with animated banners, custom color themes, and personalized layouts that match your unique brand identity.",
            icon: <Paintbrush className="w-6 h-6 text-pink-500" />,
            iconBg: "bg-pink-500/10",
            delay: 0.1
        },
        {
            title: "Vanity URLs",
            description: "Replace messy ID numbers with clean, professional custom profile links (e.g., sourcely.shop/yourname).",
            icon: <LinkIcon className="w-6 h-6 text-blue-500" />,
            iconBg: "bg-blue-500/10",
            delay: 0.2
        },
        {
            title: "Asset Boosting",
            description: "Get monthly boost credits to push your assets to the top of the trending page and dramatically increase your sales volume.",
            icon: <Rocket className="w-6 h-6 text-amber-500" />,
            iconBg: "bg-amber-500/10",
            delay: 0.3
        },
        {
            title: "Verified Trust Badge",
            description: "Instantly build buyer confidence with the exclusive Premium Seller badge displayed next to your name on all your listings.",
            icon: <BadgeCheck className="w-6 h-6 text-emerald-500" />,
            iconBg: "bg-emerald-500/10",
            delay: 0.4
        }
    ];

    return (
        <div className="w-full max-w-5xl mx-auto px-4 mb-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
            >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Everything you need to scale</h2>
                <p className="text-neutral-400 max-w-2xl mx-auto text-lg">
                    Premium gives you the ultimate toolset to build your brand, increase visibility, and maximize your conversions on Sourcely.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: feature.delay, duration: 0.5 }}
                        whileHover={{ y: -5 }}
                        className="relative group overflow-hidden rounded-xl glass-card transition-all h-full"
                    >
                        <div className="relative z-10 flex flex-col h-full p-8">
                            <div className={`w-fit p-3 rounded-xl mb-6 ${feature.iconBg}`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-neutral-400 leading-relaxed flex-1">
                                {feature.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
