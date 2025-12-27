'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function voteProfile(targetUserId: string, voteType: 'up' | 'down') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')
    if (user.id === targetUserId) throw new Error('Cannot vote for yourself')

    // Check existing vote
    const { data: existingVote } = await supabase
        .from('profile_votes')
        .select('id, vote_type')
        .eq('voter_id', user.id)
        .eq('target_user_id', targetUserId)
        .single()

    if (existingVote) {
        if (existingVote.vote_type === voteType) {
            // Toggle off (delete)
            await supabase
                .from('profile_votes')
                .delete()
                .eq('id', existingVote.id)
        } else {
            // Change vote
            await supabase
                .from('profile_votes')
                .update({ vote_type: voteType })
                .eq('id', existingVote.id)
        }
    } else {
        // New vote
        await supabase
            .from('profile_votes')
            .insert({
                voter_id: user.id,
                target_user_id: targetUserId,
                vote_type: voteType
            })
    }

    revalidatePath(`/users/${targetUserId}`)
}

export async function updateProfile(userId: string, data: { name?: string, description?: string, roles?: string[] }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
        throw new Error('Unauthorized')
    }

    const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', userId)

    if (error) throw error

    revalidatePath(`/users/${userId}`)
}
