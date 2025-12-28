import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { stripe } from '@/utils/stripe/server'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Fetch user's subscription ID
        const { data: userDetails } = await supabase
            .from('users')
            .select('stripe_subscription_id')
            .eq('id', user.id)
            .single()

        if (!userDetails?.stripe_subscription_id) {
            return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
        }

        // Cancel Subscription in Stripe (at period end)
        await stripe.subscriptions.update(userDetails.stripe_subscription_id, {
            cancel_at_period_end: true
        })

        // We do NOT revoke access immediately. 
        // The webhook will handle revoking access when the subscription actually expires.

        return NextResponse.json({ success: true, message: 'Subscription will be canceled at the end of the billing period.' })
    } catch (err: any) {
        console.error('Stripe Cancellation Error:', err)
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
    }
}
