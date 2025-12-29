'use server'

import { createAdminClient, createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function deleteAccount() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const supabaseAdmin = await createAdminClient()
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (error) {
        console.error('Error deleting user:', error)
        throw new Error(error.message)
    }

    redirect('/')
}

export async function updateSocialAccounts(data: {
    discord_handle: string
    roblox_handle: string
    discord_visible: boolean
    roblox_visible: boolean
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const { error } = await supabase
        .from('users')
        .update({
            discord_handle: data.discord_handle,
            roblox_handle: data.roblox_handle,
            discord_visible: data.discord_visible,
            roblox_visible: data.roblox_visible,
        })
        .eq('id', user.id)

    if (error) {
        console.error('Error updating social accounts:', error)
        throw new Error(error.message)
    }
}

export async function updatePreferences(data: {
    show_new_version_popup: boolean
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const { error } = await supabase
        .from('users')
        .update({
            show_new_version_popup: data.show_new_version_popup,
        })
        .eq('id', user.id)

    if (error) {
        console.error('Error updating preferences:', error)
        throw new Error(error.message)
    }
}

export async function checkUsernameAvailability(username: string) {
    const supabaseAdmin = await createAdminClient()

    // Check if any user has this username
    const { data, error } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('username', username)
        .single() // Returns error if 0 rows (PGRST116) or >1 rows

    if (error && error.code === 'PGRST116') {
        // No user found with this username -> Available
        return true
    }

    if (data) {
        // User found -> Taken
        return false
    }

    // Some other error occurred
    console.error('Error checking username:', error)
    return false // Fail safe to "taken" if error
}
