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
