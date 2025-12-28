'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function claimFreeAsset(assetId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Verify asset is actually free
    const { data: asset, error: assetError } = await supabase
        .from('asset_listings')
        .select('price_cents, title, seller_id')
        .eq('id', assetId)
        .single()

    if (assetError || !asset) {
        throw new Error('Asset not found')
    }

    if (asset.price_cents > 0) {
        throw new Error('This asset is not free')
    }

    // Check if already owned
    const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('listing_id', assetId)
        .eq('status', 'complete')
        .single()

    if (existingOrder) {
        return { success: true, message: 'You already own this asset' }
    }

    // Create "order" for free item
    const { error: orderError } = await supabase
        .from('orders')
        .insert({
            buyer_id: user.id,
            listing_id: assetId,
            seller_id: asset.seller_id,
            amount_cents: 0,
            status: 'complete',
            stripe_payment_intent_id: 'free_claim',
        })

    if (orderError) {
        console.error('Error claiming free asset:', orderError)
        throw new Error('Failed to claim asset')
    }

    revalidatePath(`/assets/${assetId}`)
    return { success: true }
}
