'use client';
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import confetti from "canvas-confetti";
import React, { useEffect, useState } from "react";
import { FlappyBird } from "@/components/FlappyBird";
import { getFlappyScore } from "./actions";

export default function EasterEggPage() {
    const [highScore, setHighScore] = useState(0);

    useEffect(() => {
        getFlappyScore().then(setHighScore);
    }, []);

    const handleClick = () => {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };

        const randomInRange = (min: number, max: number) => {
            return Math.random() * (max - min) + min;
        }

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    return (
        <BackgroundGradientAnimation>
            <div className="absolute z-50 inset-0 flex flex-col items-center justify-center text-white font-bold px-4 overflow-y-auto py-20">
                <div className="flex flex-col items-center mb-12 pointer-events-none">
                    <p className="text-3xl md:text-4xl lg:text-7xl bg-clip-text text-transparent drop-shadow-2xl bg-gradient-to-b from-white/80 to-white/20 text-center">
                        You found the secret!
                    </p>
                    <div className="mt-8 pointer-events-auto">
                        <button
                            onClick={handleClick}
                            className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full text-xl hover:bg-white/20 hover:scale-105 transition-all duration-300 shadow-xl"
                        >
                            🎉 Celebrate
                        </button>
                    </div>
                </div>

                <div className="pointer-events-auto">
                    <FlappyBird initialHighScore={highScore} />
                </div>
            </div>
        </BackgroundGradientAnimation>
    );
}
