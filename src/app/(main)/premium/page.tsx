import { BackgroundLines } from "@/components/ui/background-lines";
import { WavyBackground } from "@/components/ui/wavy-background";
import { PricingSection } from "@/components/PricingSection";
import { createClient } from "@/utils/supabase/server";
import { PremiumSuccessModal } from "@/components/PremiumSuccessModal";

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
            <PremiumSuccessModal />

            <div className="fixed inset-0 z-0">
                <WavyBackground className="max-w-4xl mx-auto pb-40" backgroundFill="#000000" />
            </div>

            <div className="min-h-screen flex flex-col items-center justify-start pt-32 px-4">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white/90 to-white/40 tracking-tight drop-shadow-2xl text-center">
                    Premium
                </h1>
                <PricingSection isPremium={isPremium} />
            </div>
        </div>
    )
}
