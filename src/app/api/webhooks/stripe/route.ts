import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/utils/stripe/server'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
    const body = await request.text()
    const signature = (await headers()).get('stripe-signature') as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (err) {
        console.error(`Webhook signature verification failed.`, err)
        return NextResponse.json({ error: 'Webhook signature verification failed.' }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        const metadata = session.metadata

        if (metadata) {
            const supabaseAdmin = await createAdminClient()

            // Handle Premium Subscription
            if (metadata.type === 'premium_subscription') {
                // Fetch subscription to get interval
                const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
                const interval = subscription.items.data[0].price.recurring?.interval;

                const { error } = await supabaseAdmin
                    .from('users')
                    .update({
                        is_premium: true,
                        stripe_subscription_id: session.subscription as string,
                        stripe_customer_id: session.customer as string,
                        subscription_interval: interval
                    })
                    .eq('id', metadata.userId)

                if (error) {
                    console.error('Error updating user premium status:', error)
                    return NextResponse.json({ error: 'Error updating user premium status' }, { status: 500 })
                }

                // Create Welcome Notification
                await supabaseAdmin
                    .from('notifications')
                    .insert({
                        user_id: metadata.userId,
                        type: 'premium_welcome',
                        data: {},
                        read: false
                    })

                // Record Subscription in Orders Table (Revenue Tracking)
                await supabaseAdmin
                    .from('orders')
                    .insert({
                        buyer_id: metadata.userId,
                        seller_id: null, // Platform sale
                        listing_id: null, // Subscription
                        amount_paid_cents: session.amount_total!,
                        commission_cents: session.amount_total!, // 100% revenue
                        status: 'complete',
                        stripe_charge_id: session.payment_intent as string,
                    })

                return NextResponse.json({ received: true })
            }

            // Handle Marketplace Order
            const { error } = await supabaseAdmin
                .from('orders')
                .insert({
                    buyer_id: metadata.buyerId,
                    seller_id: metadata.sellerId,
                    listing_id: metadata.listingId,
                    amount_paid_cents: session.amount_total!,
                    commission_cents: parseInt(metadata.commissionCents),
                    status: 'complete',
                    stripe_charge_id: session.payment_intent as string,
                })
                .select()
                .single()

            if (error) {
                console.error('Error creating order:', error)
                return NextResponse.json({ error: 'Error creating order' }, { status: 500 })
            }

            // Create Notification for Seller
            const { error: notificationError } = await supabaseAdmin
                .from('notifications')
                .insert({
                    user_id: metadata.sellerId,
                    type: 'sale',
                    data: {
                        amount_cents: session.amount_total,
                        listing_id: metadata.listingId,
                        buyer_id: metadata.buyerId,
                    },
                    read: false
                })

            if (notificationError) {
                console.error('Error creating notification:', notificationError)
                // Don't fail the webhook if notification fails, just log it
            }

            // Remove from Wishlist
            const { error: wishlistError } = await supabaseAdmin
                .from('wishlist')
                .delete()
                .eq('user_id', metadata.buyerId)
                .eq('asset_id', metadata.listingId)

            if (wishlistError) {
                console.error('Error removing from wishlist:', wishlistError)
                // Don't fail webhook
            }
        }
    }

    // Handle Subscription Deletion/Cancellation
    if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
        const subscription = event.data.object as Stripe.Subscription

        // If subscription is canceled
        if (event.type === 'customer.subscription.deleted' || subscription.status === 'canceled') {
            const supabaseAdmin = await createAdminClient()

            const { error } = await supabaseAdmin
                .from('users')
                .update({
                    is_premium: false,
                    stripe_subscription_id: null,
                    profile_theme: { backgroundColor: 'default' }
                })
                .eq('stripe_customer_id', subscription.customer as string)

            if (error) {
                console.error('Error resetting user premium status:', error)
                return NextResponse.json({ error: 'Error resetting user premium status' }, { status: 500 })
            }
        }
    }

    return NextResponse.json({ received: true })
}
