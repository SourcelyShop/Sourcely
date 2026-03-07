import { BackgroundLines } from "@/components/ui/background-lines";
import { WavyBackground } from "@/components/ui/wavy-background";
import { PricingSection } from "@/components/PricingSection";
import { createClient } from "@/utils/supabase/server";
import { PremiumSuccessModal } from "@/components/PremiumSuccessModal";
import { PremiumFeatureGrid } from "@/components/PremiumFeatureGrid";

export default async function PremiumPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let isPremium = false;
    if (user) {
        const { data: userData } = await supabase
            .from('users')
            .select('is_premium')
            .eq('id', user.id)
            .single();
        isPremium = userData?.is_premium || false;
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <div className="fixed inset-0 z-0">
                <WavyBackground className="max-w-4xl mx-auto pb-40" backgroundFill="#000000" />
            </div>

            <PremiumSuccessModal />
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-start pt-32 pb-24 px-4 w-full">
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-b from-white/90 to-white/40 tracking-tight drop-shadow-2xl">
                        Stand Out. Sell More.
                        <br className="max-md:hidden" />
                        <span> Go Premium.</span>
                    </h1>
                    <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
                        Unlock powerful tools to build your brand, rank higher in search, and maximize your earnings on Sourcely.
                    </p>
                </div>

                <PricingSection isPremium={isPremium} />
            </div>
        </div>
    )
}
