import { createClient, createAdminClient } from "@/utils/supabase/server";
import { WavyBackground } from "@/components/ui/wavy-background";
import { AssetCard } from "@/components/AssetCard";
import { getAssetStats } from "@/utils/getAssetStats";
import { DiscoverFilters } from "@/components/DiscoverFilters";
import { DiscoverSearch } from "@/components/DiscoverSearch";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/animations";
import { MobileFilters } from "@/components/MobileFilters";

export default async function DiscoverPage({
    searchParams,
}: {
    searchParams: { q?: string; category?: string; price?: string; sort?: string }
}) {
    const supabase = await createClient()
    const supabaseAdmin = await createAdminClient()
    const params = await searchParams;
    const query = params?.q || ''
    const category = params?.category || ''
    const price = params?.price || 'all'
    const sort = params?.sort || 'newest'

    // Build Query
    let dbQuery = supabaseAdmin
        .from('asset_listings')
        .select(`
            *,
            seller:users(name, is_premium)
        `)
        .is('deletion_scheduled_at', null)

    // Apply Filters
    if (query) {
        dbQuery = dbQuery.ilike('title', `%${query}%`)
    }

    if (category) {
        dbQuery = dbQuery.eq('category', category)
    }

    if (price === 'free') {
        dbQuery = dbQuery.eq('price_cents', 0)
    } else if (price === 'paid') {
        dbQuery = dbQuery.gt('price_cents', 0)
    }

    // Apply Sort
    switch (sort) {
        case 'popular':
            // For popular, we'd ideally join with stats, but for now let's sort by views if available or just created_at
            // Since views are in a separate table/stats, complex sorting might need a different approach or RPC
            // Fallback to created_at for now, or maybe random?
            dbQuery = dbQuery.order('created_at', { ascending: false })
            break;
        case 'price_asc':
            dbQuery = dbQuery.order('price_cents', { ascending: true })
            break;
        case 'price_desc':
            dbQuery = dbQuery.order('price_cents', { ascending: false })
            break;
        case 'newest':
        default:
            dbQuery = dbQuery.order('created_at', { ascending: false })
            break;
    }

    const { data: assetsData } = await dbQuery

    // Fetch User Wishlist
    const { data: { user } } = await supabase.auth.getUser()
    let wishlistedAssetIds = new Set<string>()

    if (user) {
        const { data: wishlistItems } = await supabase
            .from('wishlist')
            .select('asset_id')
            .eq('user_id', user.id)

        if (wishlistItems) {
            wishlistedAssetIds = new Set(wishlistItems.map(item => item.asset_id))
        }
    }

    // Fetch Stats
    const assetIds = assetsData?.map(a => a.id) || []
    const stats = await getAssetStats(assetIds)

    const assets = assetsData?.map(asset => ({
        ...asset,
        stats: stats[asset.id],
        isWishlisted: wishlistedAssetIds.has(asset.id)
    }))

    // Sort by popularity in memory if needed
    if (sort === 'popular' && assets) {
        assets.sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0))
    }

    return (
        <div className="relative min-h-screen w-full">
            {/* Background */}
            <div className="fixed inset-0 z-0">
                <WavyBackground className="max-w-4xl mx-auto pb-40" backgroundFill="#000000" />
            </div>

            <div className="relative z-10 pt-24 px-4 pb-20 max-w-7xl mx-auto">
                <FadeIn>
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">Discover</h1>
                            <p className="text-neutral-400 max-w-lg">
                                Explore the best assets created by the community. Find models, scripts, and more for your next project.
                            </p>
                        </div>
                        <DiscoverSearch />
                    </div>
                </FadeIn>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters (Desktop) */}
                    <div className="hidden lg:block w-64 shrink-0">
                        <div className="sticky top-24 glass-card p-6 rounded-xl border border-white/10">
                            <DiscoverFilters />
                        </div>
                    </div>

                    {/* Mobile Filters */}
                    <div className="lg:hidden mb-6">
                        <MobileFilters />
                    </div>

                    {/* Results Grid */}
                    <div className="flex-1">
                        {assets && assets.length > 0 ? (
                            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {assets.map((asset) => (
                                    <StaggerItem key={asset.id}>
                                        <AssetCard asset={asset} />
                                    </StaggerItem>
                                ))}
                            </StaggerContainer>
                        ) : (
                            <FadeIn>
                                <div className="glass-card p-12 rounded-xl border border-white/10 text-center">
                                    <h3 className="text-xl font-bold text-white mb-2">No assets found</h3>
                                    <p className="text-neutral-400">
                                        Try adjusting your filters or search terms to find what you're looking for.
                                    </p>
                                </div>
                            </FadeIn>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
