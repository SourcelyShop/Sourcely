import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { stripe } from '@/utils/stripe/server'

const PLATFORM_COMMISSION_RATE = 0.2 // 20% commission

export async function POST(request: Request) {
    const formData = await request.formData()
    const listingId = formData.get('listingId') as string
    const origin = new URL(request.url).origin

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.redirect(`${origin}/login?next=/assets/${listingId}`)
    }

    // Fetch listing details using Admin Client to bypass RLS for seller info
    const supabaseAdmin = await createAdminClient()
    const { data: listing } = await supabaseAdmin
        .from('asset_listings')
        .select(`
      *,
      seller:users(stripe_account_id)
    `)
        .eq('id', listingId)
        .single()

    if (!listing) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (!listing.seller?.stripe_account_id) {
        return NextResponse.json({ error: 'Seller has not connected Stripe' }, { status: 400 })
    }

    // Calculate commission
    const priceCents = listing.price_cents
    const platformFeeCents = Math.round(priceCents * PLATFORM_COMMISSION_RATE)

    try {
        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: listing.title,
                            description: listing.description,
                            // images: [listing.file_url], // Optional: Add image if available
                            metadata: {
                                listingId: listing.id,
                                sellerId: listing.seller_id,
                            },
                        },
                        unit_amount: priceCents,
                    },
                    quantity: 1,
                },
            ],
            payment_intent_data: {
                application_fee_amount: platformFeeCents,
                transfer_data: {
                    destination: listing.seller.stripe_account_id,
                },
                metadata: {
                    listingId: listing.id,
                    buyerId: user.id,
                    sellerId: listing.seller_id,
                    commissionCents: platformFeeCents,
                },
            },
            metadata: {
                listingId: listing.id,
                buyerId: user.id,
                sellerId: listing.seller_id,
                commissionCents: platformFeeCents,
            },
            success_url: `${origin}/assets/${listing.id}?success=true`,
            cancel_url: `${origin}/assets/${listing.id}?canceled=true`,
        })

        if (!session.url) {
            return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
        }

        return NextResponse.redirect(session.url, 303)
    } catch (err: any) {
        console.error('Stripe Checkout Error:', err)
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
    }
}
