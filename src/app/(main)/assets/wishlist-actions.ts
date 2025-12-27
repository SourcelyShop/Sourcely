'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleWishlist(assetId: string) {
    console.log('toggleWishlist called with assetId:', assetId)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        console.error('toggleWishlist: No user found')
        throw new Error('Unauthorized')
    }
    console.log('toggleWishlist: User found:', user.id)

    // Check if user is the owner
    const { data: asset, error: assetError } = await supabase
        .from('asset_listings')
        .select('seller_id')
        .eq('id', assetId)
        .single()

    if (assetError) {
        console.error('toggleWishlist: Error fetching asset:', assetError)
    }

    if (asset?.seller_id === user.id) {
        throw new Error('You cannot wishlist your own asset')
    }

    // Check if user has already purchased
    const { data: purchase } = await supabase
        .from('orders')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('listing_id', assetId)
        .eq('status', 'complete')
        .single()

    if (purchase) {
        // Ensure it's not in wishlist
        await supabase
            .from('wishlist')
            .delete()
            .eq('user_id', user.id)
            .eq('asset_id', assetId)

        throw new Error('You already own this asset')
    }

    // Check if already in wishlist
    const { data: existing, error: fetchError } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('asset_id', assetId)
        .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('toggleWishlist: Error checking existing:', fetchError)
    }

    if (existing) {
        console.log('toggleWishlist: Removing from wishlist, id:', existing.id)
        // Remove
        const { error } = await supabase
            .from('wishlist')
            .delete()
            .eq('id', existing.id)

        if (error) {
            console.error('Error removing from wishlist:', error)
            throw new Error('Failed to remove from wishlist')
        }
        console.log('toggleWishlist: Removed successfully')
    } else {
        console.log('toggleWishlist: Adding to wishlist')
        // Add
        const { error, data } = await supabase
            .from('wishlist')
            .insert({
                user_id: user.id,
                asset_id: assetId
            })
            .select()

        if (error) {
            console.error('Error adding to wishlist:', error)
            throw new Error('Failed to add to wishlist: ' + error.message)
        }
        console.log('toggleWishlist: Added successfully', data)
    }

    revalidatePath('/dashboard/saved')
    revalidatePath(`/assets/${assetId}`)
    revalidatePath('/')
}

export async function checkIsWishlisted(assetId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    const { data } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('asset_id', assetId)
        .single()

    return !!data
}
