
import React from "react";

import { BackgroundLines } from "@/components/ui/background-lines";
import { WaitlistForm } from "@/components/WaitlistForm";
import { getWaitlistCount } from "./actions";



export default async function WaitlistPage() {
    const count = await getWaitlistCount();

    return (
        <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden font-sans">

            <BackgroundLines className="flex items-center justify-center w-full flex-col px-4">
                <div className="z-20 flex flex-col items-center text-center max-w-2xl mx-auto">
                    <div className="mb-8 flex items-center gap-2 opacity-80">
                        {/* Logo placeholder if needed */}
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white/90 to-white/40 tracking-tight drop-shadow-2xl">
                            Sourcely
                        </h1>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 drop-shadow-2xl">
                        Capture anything. <br />
                        <span className="text-neutral-400">Remember everything.</span>
                    </h1>

                    <p className="text-lg text-neutral-400 mb-10 max-w-lg mx-auto leading-relaxed">
                        The ultimate marketplace for Roblox developers. Join the waitlist to get early access and exclusive rewards.
                    </p>

                    <WaitlistForm />

                    <div className="mt-12 flex items-center gap-4 text-sm text-neutral-600">
                        <span>Joined by {count.toLocaleString()}+ developers</span>
                    </div>
                </div>
            </BackgroundLines>
        </div>
    );
}
