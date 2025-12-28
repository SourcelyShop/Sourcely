import React from 'react'
import { BackgroundLines } from "@/components/ui/background-lines";
import { BecomePartnerLink } from '@/components/BecomePartnerLink';
import Link from 'next/link'
import { Tooltip } from '@/components/ui/tooltip'

const PARTNERS = [
    {
        name: "Your name",
        logo: "https://placehold.co/64x64",
        link: ""
    },
    // { name: "Roblox", logo: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Roblox_player_icon_black.svg", link: "https://roblox.com" },
    // { name: "Unity", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Unity_2021.svg", link: "https://unity.com" },
    // { name: "Unreal Engine", logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/UE_Logo_Black_Centered.svg", link: "https://unrealengine.com" },
    // { name: "Blender", logo: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Blender_logo_no_text.svg", link: "https://blender.org" },
    // { name: "Adobe", logo: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Adobe_Corporate_Logo.png", link: "https://adobe.com" },
    // { name: "Figma", logo: "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg", link: "https://figma.com" },
]

export default function PartnersPage() {
    return (
        <div className="min-h-screen bg-black">
            {/* Hero Section */}
            <BackgroundLines className="flex flex-col items-center justify-center w-full flex-1 px-4 py-20">
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white/90 to-white/40 tracking-tight drop-shadow-2xl text-center pb-2">
                        Our Partners
                    </h1>
                    <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-12">
                        We collaborate with different communities and creators to bring you the best resources for your development journey.
                    </p>

                    <div className="flex justify-center gap-4">
                        <BecomePartnerLink />
                    </div>
                </div>
            </BackgroundLines>

            {/* Partners Grid */}
            <div className="max-w-7xl mx-auto px-4 pb-32">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
                    {PARTNERS.map((partner, idx) => (
                        <Tooltip key={idx} content={partner.name}>
                            <Link
                                href={partner.link}
                                className="glass-card p-8 rounded-xl border border-white/5 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 hover:bg-white/5 group"
                                target="_blank"
                            >
                                <img
                                    src={partner.logo}
                                    alt={partner.name}
                                    className="h-12 w-auto object-contain opacity-50 group-hover:opacity-100 transition-opacity invert"
                                />
                            </Link>
                        </Tooltip>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="mt-32 glass-card p-12 rounded-3xl border border-white/10 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10" />
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold text-white mb-4">Ready to build together?</h2>
                        <p className="text-neutral-400 mb-8 max-w-xl mx-auto">
                            Join our partner program and get access to exclusive resources, early access features, and community support.
                        </p>
                        <Link
                            href="/support?subject=Partnership"
                            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                        >
                            Contact Partnership Team
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
