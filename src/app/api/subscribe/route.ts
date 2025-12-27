import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { stripe } from '@/utils/stripe/server'

export async function POST(request: Request) {
    const origin = new URL(request.url).origin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { interval } = body

        const priceCents = interval === 'year' ? 4800 : 500 // $48.00 or $5.00
        const recurringInterval = interval === 'year' ? 'year' : 'month'

        // Create Stripe Checkout Session for Subscription
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Sourcely Premium',
                            description: 'Unlock exclusive features for founders and teams.',
                        },
                        unit_amount: priceCents,
                        recurring: {
                            interval: recurringInterval as any,
                        },
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                userId: user.id,
                type: 'premium_subscription',
            },
            success_url: `${origin}/premium?success=true`,
            cancel_url: `${origin}/premium?canceled=true`,
        })

        if (!session.url) {
            return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
        }

        return NextResponse.json({ url: session.url })
    } catch (err: any) {
        console.error('Stripe Subscription Error:', err)
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
    }
}
