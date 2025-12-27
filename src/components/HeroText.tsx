import { FlipWords } from "@/components/ui/flip-words";

export function HeroText() {
    const words = ["Developers", "Animators", "Modelers", "Creators"];

    return (
        <div className="text-xl text-white/80 max-w-2xl mx-auto mb-10 drop-shadow-md flex items-center justify-center flex-wrap">
            <span>The premium marketplace for Roblox assets built for<FlipWords words={words} className="text-white/80 font-semibold" /> </span>

        </div>
    );
}
