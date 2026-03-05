'use server'

import { createAdminClient, createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import crypto from 'crypto'

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

export async function getRobloxVerificationCode() {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        throw new Error('Not authenticated')
    }

    // Generate a deterministic code based on user ID
    const secret = process.env.SUPABASE_JWT_SECRET || 'fallback-secret-for-dev'
    const hash = crypto.createHash('md5').update(user.id + secret).digest('hex').substring(0, 8)
    return `Sourcely-${hash}`
}

export async function verifyRobloxProfileCode(profileUrl: string) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        throw new Error('Not authenticated')
    }

    if (!profileUrl || !profileUrl.trim()) {
        throw new Error('Please provide your Roblox Profile URL.')
    }

    // Extract the Roblox ID from the URL
    const urlMatch = profileUrl.match(/users\/(\d+)/i)
    if (!urlMatch || !urlMatch[1]) {
        throw new Error('Invalid Roblox profile link. It should look like: https://www.roblox.com/users/12345678/profile')
    }
    const robloxId = urlMatch[1]

    const expectedCode = await getRobloxVerificationCode()

    // 1. Call Roblox API to get the user's profile description and name
    const profileRes = await fetch(`https://users.roblox.com/v1/users/${robloxId}`)

    if (!profileRes.ok) {
        throw new Error('Failed to fetch Roblox profile data. Ensure the link is correct.')
    }

    const profileData = await profileRes.json()
    const actualUsername = profileData.name
    const description = profileData.description || ''

    // 2. Check for the code
    if (!description.includes(expectedCode)) {
        throw new Error(`Verification code not found! Please place "${expectedCode}" in your Roblox profile About section. It might take a minute to update on Roblox's end.`)
    }

    // 4. Update Database
    const { error: updateError } = await supabase
        .from('users')
        .update({
            roblox_handle: actualUsername,
        })
        .eq('id', user.id)

    if (updateError) {
        console.error('Error updating Roblox handle:', updateError)
        throw new Error(updateError.message)
    }

    return { success: true, username: actualUsername }
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
