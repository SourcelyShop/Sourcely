import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { stripe } from '@/utils/stripe/server'

export async function GET(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Create a Stripe Connect Account if not exists
        const { data: userData } = await supabase
            .from('users')
            .select('stripe_account_id')
            .eq('id', user.id)
            .single()

        let accountId = userData?.stripe_account_id

        // Verify if the account exists in the current environment (Test vs Live)
        if (accountId) {
            try {
                await stripe.accounts.retrieve(accountId)
            } catch (error) {
                console.warn('Stripe account not found (likely environment mismatch), creating new one.')
                accountId = null
            }
        }

        if (!accountId) {
            const account = await stripe.accounts.create({
                type: 'express',
                email: user.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
            })
            accountId = account.id

            // Save to DB
            await supabase
                .from('users')
                .update({ stripe_account_id: accountId })
                .eq('id', user.id)
        }

        // 2. Create an Account Link
        const origin = new URL(request.url).origin
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${origin}/dashboard/seller?onboarding=refresh`,
            return_url: `${origin}/dashboard/seller?onboarding=complete`,
            type: 'account_onboarding',
        })

        return NextResponse.redirect(accountLink.url)
    } catch (error) {
        console.error('Stripe Connect Error:', error)
        return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
    }
}
