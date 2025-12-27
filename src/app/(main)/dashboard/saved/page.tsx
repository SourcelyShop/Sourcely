import { createClient } from '@/utils/supabase/server'
import { AssetCard } from '@/components/AssetCard'
import { redirect } from 'next/navigation'
import { Heart } from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/animations";

export default async function SavedAssetsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: wishlistItems } = await supabase
        .from('wishlist')
        .select(`
            asset_id,
            asset:asset_listings (
                *,
                seller:users(name, is_premium)
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    // Transform data to match AssetCard interface
    const assets = wishlistItems?.map(item => {
        const asset = item.asset as any
        return {
            ...asset,
            isWishlisted: true, // Since it's in the saved page
            stats: {
                salesCount: 0, // We might want to join these if needed, but keeping it simple for now
                upvotes: 0,
                downvotes: 0
            }
        }
    }) || []

    return (
        <div className="min-h-screen bg-black/95 p-8 pt-24">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                        <Heart className="w-8 h-8 text-red-500 fill-red-500/20" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Saved Assets</h1>
                        <p className="text-neutral-400">Your collection of favorite items</p>
                    </div>
                </div>

                {assets.length === 0 ? (
                    <FadeIn>
                        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                            <Heart className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No saved assets yet</h3>
                            <p className="text-neutral-400 max-w-md mx-auto">
                                Browse the marketplace and click the heart icon to save items for later.
                            </p>
                        </div>
                    </FadeIn>
                ) : (
                    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assets.map((asset) => (
                            <StaggerItem key={asset.id}>
                                <AssetCard asset={asset} />
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                )}
            </div>
        </div>
    )
}
