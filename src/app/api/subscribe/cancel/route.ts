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

        // Cancel Subscription in Stripe
        await stripe.subscriptions.cancel(userDetails.stripe_subscription_id)

        // Update User in Database
        const supabaseAdmin = await createAdminClient()
        const { error } = await supabaseAdmin
            .from('users')
            .update({
                is_premium: false,
                stripe_subscription_id: null,
                stripe_customer_id: null,
                profile_theme: { backgroundColor: 'default' }
            })
            .eq('id', user.id)

        if (error) {
            console.error('Error updating user status:', error)
            return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (err: any) {
        console.error('Stripe Cancellation Error:', err)
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
    }
}
