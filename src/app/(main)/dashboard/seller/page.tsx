import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, DollarSign, Package } from 'lucide-react'
import { AssetCard } from '@/components/AssetCard'
import { stripe } from '@/utils/stripe/server'
import { getAssetStats } from '@/utils/getAssetStats'
import { StripeOnboardingHandler } from '@/components/StripeOnboardingHandler'

export default async function SellerDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: userData } = await supabase
        .from('users')
        .select('stripe_account_id')
        .eq('id', user.id)
        .single()

    let isStripeConnected = false
    if (userData?.stripe_account_id) {
        try {
            const account = await stripe.accounts.retrieve(userData.stripe_account_id)
            isStripeConnected = account.details_submitted
        } catch (error) {
            console.error('Error fetching Stripe account:', error)
        }
    }

    // Fetch Listings
    const { data: listings } = await supabase
        .from('asset_listings')
        .select(`
            *,
            seller:users(name)
        `)
        .eq('seller_id', user.id)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })

    const listingsData = listings || []
    const assetIds = listingsData.map(l => l.id)
    const stats = await getAssetStats(assetIds)

    const listingsWithStats = listingsData.map(listing => ({
        ...listing,
        stats: stats[listing.id]
    }))

    // Fetch Earnings from Stripe
    let totalEarningsCents = 0
    if (userData?.stripe_account_id) {
        try {
            const balance = await stripe.balance.retrieve({
                stripeAccount: userData.stripe_account_id
            })
            // Sum available and pending balances from all currencies (assuming USD/single currency for now or just summing raw numbers)
            // Typically balance.available is an array.
            const available = balance.available.reduce((acc, curr) => acc + curr.amount, 0)
            const pending = balance.pending.reduce((acc, curr) => acc + curr.amount, 0)
            totalEarningsCents = available + pending
        } catch (error) {
            console.error('Error fetching Stripe balance:', error)
        }
    }

    return (
        <div className="relative min-h-screen w-full">
            <StripeOnboardingHandler isConnected={isStripeConnected} />
            <div className="max-h-screen flex flex-col items-around justify-top px-40 py-17">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-5xl font-bold text-white">Seller Dashboard</h1>
                        <p className="text-muted-foreground text-white">Manage your listings and earnings</p>
                    </div>
                    <Link
                        href="/dashboard/seller/listings/new"
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-white bg-neutral-900/50"
                    >
                        <Plus className="w-4 h-4 text-white" />
                        New Listing
                    </Link>
                </header>

                {!isStripeConnected ? (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mb-8 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-yellow-500">Payment Setup Required</h3>
                            <p className="text-muted-foreground text-white">Connect your Stripe account to start receiving payouts.</p>
                        </div>
                        <a
                            href="/api/stripe/connect"
                            className="bg-yellow-500 text-black font-semibold px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors"
                        >
                            Connect Stripe
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 ">
                        <div className="glass-card p-6 rounded-xl  border border-white/10 ">
                            <div className="flex items-center gap-4 mb-4 ">
                                <div className="p-3 bg-green-500/10 rounded-lg">
                                    <DollarSign className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground text-white">Total Earnings</p>
                                    <h3 className="text-2xl font-bold text-white">${(totalEarningsCents / 100).toFixed(2)}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6 rounded-xl border border-white/10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-lg">
                                    <Package className="w-6 h-6 text-blue-500 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground text-white">Active Listings</p>
                                    <h3 className="text-2xl font-bold text-white">{listings?.length || 0}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white">Your Listings</h3>

                    {listingsWithStats && listingsWithStats.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {listingsWithStats.map((listing) => (
                                <AssetCard key={listing.id} asset={listing} />
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card rounded-xl border border-white/10 p-12 text-center text-muted-foreground text-white">
                            No listings yet. Create your first asset to start selling!
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
