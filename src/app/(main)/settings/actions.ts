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

export async function linkDiscordAccount() {
    const supabase = await createClient()

    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl) {
        baseUrl = `https://${process.env.VERCEL_URL}`
    }
    if (!baseUrl || baseUrl === 'undefined') {
        baseUrl = 'https://www.sourcely.shop'
    }

    const { data, error } = await supabase.auth.linkIdentity({
        provider: 'discord',
        options: {
            redirectTo: `${baseUrl}/auth/callback?type=link&next=/settings`,
        },
    })

    if (error) {
        console.error('Error linking Discord:', error)
        throw new Error(error.message)
    }

    if (data.url) {
        redirect(data.url)
    }
}

export async function unlinkDiscordAccount() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    // Unlink the identity from auth
    const discordIdentity = user.identities?.find(id => id.provider === 'discord')
    if (discordIdentity) {
        const { error: unlinkError } = await supabase.auth.unlinkIdentity(discordIdentity)
        if (unlinkError) {
            console.error('Error unlinking Discord identity:', unlinkError)
            throw new Error(unlinkError.message)
        }
    }

    // Remove the handle from the public profile
    const { error: updateError } = await supabase
        .from('users')
        .update({
            discord_handle: null,
            discord_visible: false,
        })
        .eq('id', user.id)

    if (updateError) {
        console.error('Error removing Discord handle from profile:', updateError)
        throw new Error(updateError.message)
    }
}

export async function verifyRobloxWithBloxlink() {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        throw new Error('Not authenticated')
    }

    // 1. Get Discord Identity
    const discordIdentity = user.identities?.find(id => id.provider === 'discord')
    if (!discordIdentity) {
        throw new Error('Please link your Discord account first to verify via Bloxlink.')
    }

    const discordId = discordIdentity.identity_data?.provider_id || discordIdentity.identity_data?.sub || discordIdentity.id
    if (!discordId) {
        throw new Error('Could not find Discord ID.')
    }

    // 2. Call Bloxlink API
    const bloxlinkApiKey = process.env.BLOXLINK_API_KEY
    if (!bloxlinkApiKey) {
        console.error('Missing BLOXLINK_API_KEY')
        throw new Error('Server configuration error. Bloxlink API Key missing.')
    }

    const bloxlinkRes = await fetch(`https://api.blox.link/v4/public/discord-to-roblox/${discordId}`, {
        headers: {
            'Authorization': bloxlinkApiKey
        }
    })

    if (!bloxlinkRes.ok) {
        if (bloxlinkRes.status === 404) {
            throw new Error('No linked Roblox account found on Bloxlink for your Discord account. Please verify with Bloxlink first.')
        }
        throw new Error('Failed to communicate with Bloxlink API.')
    }

    const bloxlinkData = await bloxlinkRes.json()
    const robloxId = bloxlinkData.robloxID

    if (!robloxId) {
        throw new Error('No linked Roblox account found on Bloxlink.')
    }

    // 3. Call Roblox API to get username
    const robloxRes = await fetch(`https://users.roblox.com/v1/users/${robloxId}`)

    if (!robloxRes.ok) {
        throw new Error('Failed to fetch Roblox profile data.')
    }

    const robloxData = await robloxRes.json()
    const robloxUsername = robloxData.name

    if (!robloxUsername) {
        throw new Error('Failed to read Roblox username.')
    }

    // 4. Update Database
    const { error: updateError } = await supabase
        .from('users')
        .update({
            roblox_handle: robloxUsername,
        })
        .eq('id', user.id)

    if (updateError) {
        console.error('Error updating Roblox handle:', updateError)
        throw new Error(updateError.message)
    }

    return { success: true, username: robloxUsername }
}

export async function unlinkRobloxAccount() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    // Ensure we don't have a linked roblox provider just in case
    const robloxIdentity = user.identities?.find(id => id.provider === 'roblox')
    if (robloxIdentity) {
        await supabase.auth.unlinkIdentity(robloxIdentity)
    }

    // Remove the handle from the profile
    const { error: updateError } = await supabase
        .from('users')
        .update({
            roblox_handle: null,
            roblox_visible: false,
        })
        .eq('id', user.id)

    if (updateError) {
        console.error('Error removing Roblox handle from profile:', updateError)
        throw new Error(updateError.message)
    }
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

export async function updateName(name: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const { error } = await supabase
        .from('users')
        .update({
            name: name,
        })
        .eq('id', user.id)

    if (error) {
        console.error('Error updating name:', error)
        throw new Error(error.message)
    }
}
