import { createClient } from '@/utils/supabase/server'
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/animations";
import { getAssetStats } from '@/utils/getAssetStats'
import { notFound, redirect } from 'next/navigation'
import { AssetCard } from '@/components/AssetCard'
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default async function PurchasedAssetsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const supabase = await createClient()
    const { id } = await params
    const { data: { user } } = await supabase.auth.getUser()

    // Privacy check: Only allow viewing own purchases
    if (!user || user.id !== id) {
        redirect('/')
    }

    // Fetch purchased assets
    const { data: orders } = await supabase
        .from('orders')
        .select(`
            listing_id,
            listing:asset_listings (
                *,
                seller:users!asset_listings_seller_id_fkey(name, is_premium)
            )
        `)
        .eq('buyer_id', user.id)
        .eq('status', 'complete')
        .order('created_at', { ascending: false })

    // Extract listings from orders and filter out nulls (deleted listings)
    const purchasesData = orders?.map((order: any) => order.listing).filter((listing: any) => listing !== null) || []

    // Fetch stats for purchases
    const assetIds = purchasesData.map((l: any) => l.id)
    const stats = await getAssetStats(assetIds)

    const purchases = purchasesData.map((listing: any) => ({
        ...listing,
        stats: stats[listing.id]
    }))

    return (
        <div className="min-h-screen bg-background py-24 px-4">
            <div className="max-w-6xl mx-auto">
                <FadeIn>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                <ShoppingBag className="w-8 h-8" />
                                My Library
                            </h1>
                        </div>
                    </div>
                </FadeIn>

                {purchases.length > 0 ? (
                    <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {purchases.map((asset: any) => (
                            <StaggerItem key={asset.id}>
                                <AssetCard asset={asset} />
                            </StaggerItem>
                        ))}
                    </StaggerContainer>
                ) : (
                    <FadeIn delay={0.2}>
                        <div className="text-center py-20 glass-card rounded-xl border border-white/10">
                            <ShoppingBag className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-white mb-2">No purchases yet</h2>
                            <p className="text-neutral-400 mb-6">Explore the marketplace to find amazing assets.</p>
                            <Link
                                href="/discover"
                                className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-colors"
                            >
                                Browse Assets
                            </Link>
                        </div>
                    </FadeIn>
                )}
            </div>
        </div>
    )
}
