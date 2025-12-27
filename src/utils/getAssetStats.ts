import { createAdminClient } from '@/utils/supabase/server'

export interface AssetStats {
    salesCount: number
    upvotes: number
    downvotes: number
}

export async function getAssetStats(assetIds: string[]): Promise<Record<string, AssetStats>> {
    if (assetIds.length === 0) return {}

    const supabase = await createAdminClient()

    // Fetch Orders (Sales)
    const { data: orders } = await supabase
        .from('orders')
        .select('listing_id')
        .in('listing_id', assetIds)
        .eq('status', 'complete')

    // Fetch Votes
    const { data: votes } = await supabase
        .from('asset_votes')
        .select('asset_id, vote_type')
        .in('asset_id', assetIds)

    // Aggregate
    const stats: Record<string, AssetStats> = {}

    // Initialize
    assetIds.forEach(id => {
        stats[id] = { salesCount: 0, upvotes: 0, downvotes: 0 }
    })

    // Count Sales
    orders?.forEach(order => {
        if (stats[order.listing_id]) {
            stats[order.listing_id].salesCount++
        }
    })

    // Count Votes
    votes?.forEach(vote => {
        if (stats[vote.asset_id]) {
            if (vote.vote_type === 'up') stats[vote.asset_id].upvotes++
            if (vote.vote_type === 'down') stats[vote.asset_id].downvotes++
        }
    })

    return stats
}
