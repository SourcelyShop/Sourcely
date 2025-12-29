'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function applyBoost(assetId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    // Fetch user details
    const { data: userData } = await supabase
        .from('users')
        .select('is_premium, boost_credits')
        .eq('id', user.id)
        .single()

    if (!userData?.is_premium) {
        throw new Error('Only premium members can boost assets')
    }

    if ((userData.boost_credits || 0) <= 0) {
        throw new Error('No boost credits available')
    }

    // Start transaction (simulated with sequential updates)

    // 1. Decrement credits
    const { error: creditError } = await supabase
        .from('users')
        .update({ boost_credits: userData.boost_credits - 1 })
        .eq('id', user.id)

    if (creditError) throw new Error('Failed to update credits')

    // 2. Apply boost to asset
    const boostDurationDays = 7
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + boostDurationDays)

    const { error: assetError } = await supabase
        .from('asset_listings')
        .update({ boost_expires_at: expiresAt.toISOString() })
        .eq('id', assetId)
        .eq('seller_id', user.id)

    if (assetError) {
        // Rollback credit (best effort)
        await supabase
            .from('users')
            .update({ boost_credits: userData.boost_credits })
            .eq('id', user.id)

        throw new Error('Failed to apply boost to asset')
    }

    revalidatePath('/dashboard/seller')
    revalidatePath('/')
}
