import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it
    // if "type=recovery" is in param, force to /update-password
    let next = searchParams.get('next') ?? '/'
    const type = searchParams.get('type')

    if (type === 'recovery') {
        next = '/update-password'
    }

    console.log('Auth Callback Debug:', {
        url: request.url,
        code: code ? 'Present' : 'Missing',
        next,
        origin
    })

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error('Auth Callback Error:', error)
        } else if (type === 'link') {
            // Identity linking successful, let's grab the Discord username
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // Find the Discord identity we just linked
                const discordIdentity = user.identities?.find(id => id.provider === 'discord')

                if (discordIdentity) {
                    const discordUsername = discordIdentity.identity_data?.preferred_username ||
                        discordIdentity.identity_data?.custom_claims?.global_name ||
                        discordIdentity.identity_data?.name

                    if (discordUsername) {
                        const { error: updateError } = await supabase
                            .from('users')
                            .update({ discord_handle: discordUsername })
                            .eq('id', user.id)

                        if (updateError) {
                            console.error('Failed to update public user with Discord handle:', updateError)
                        } else {
                            console.log('Successfully linked and updated Discord handle:', discordUsername)
                        }
                    }
                }
            }
        }

        if (!error) {
            const redirectUrl = `${origin}${next}`
            console.log('Redirecting to:', redirectUrl)
            return NextResponse.redirect(redirectUrl)
        }
    }

    // return the user to an error page with instructions
    console.log('Redirecting to error page')
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
