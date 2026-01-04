import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, DollarSign, Package, Rocket } from 'lucide-react'
import { AssetCard } from '@/components/AssetCard'
import { stripe } from '@/utils/stripe/server'
import { getAssetStats } from '@/utils/getAssetStats'
import { StripeOnboardingHandler } from '@/components/StripeOnboardingHandler'
import { BoostButton } from '@/components/BoostButton'

export default async function SellerDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: userData } = await supabase
        .from('users')
        .select('stripe_account_id, is_premium, boost_credits, last_boost_refresh_at')
        .eq('id', user.id)
        .single()

    // Handle Boost Refresh
    let boostCredits = userData?.boost_credits || 0
    if (userData?.is_premium) {
        const lastRefresh = userData.last_boost_refresh_at ? new Date(userData.last_boost_refresh_at) : null
        const now = new Date()
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1))

        if (!lastRefresh || lastRefresh < oneMonthAgo) {
            // Refresh credits (Grant 1 credit)
            // We update the DB, but for this render we just show the new value
            // Ideally this should be a separate mutation or triggered by a cron, but lazy eval works here
            const { error } = await supabase
                .from('users')
                .update({
                    boost_credits: (userData.boost_credits || 0) + 1,
                    last_boost_refresh_at: new Date().toISOString()
                })
                .eq('id', user.id)

            if (!error) {
                boostCredits = (userData.boost_credits || 0) + 1
            }
        }
    }

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
            seller:users(name, is_premium)
        `)
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

                {!isStripeConnected && (
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
                )}

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

                    {/* Boost Credits Card */}
                    <div className="glass-card p-6 rounded-xl border border-white/10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-purple-500/10 rounded-lg">
                                <Rocket className="w-6 h-6 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground text-white">Boost Credits</p>
                                <h3 className="text-2xl font-bold text-white">{boostCredits}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-white">Your Listings</h3>

                    {listingsWithStats && listingsWithStats.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {listingsWithStats.map((listing) => (
                                <div key={listing.id} className="flex flex-col gap-2">
                                    <AssetCard asset={listing} />
                                    <div className="flex justify-end">
                                        <BoostButton
                                            assetId={listing.id}
                                            hasCredits={boostCredits > 0}
                                            isBoosted={!!listing.boost_expires_at && new Date(listing.boost_expires_at) > new Date()}
                                            boostExpiresAt={listing.boost_expires_at}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card rounded-xl border border-white/10 p-12 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                <Package className="w-10 h-10 text-neutral-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No listings yet</h3>
                            <p className="text-neutral-400 max-w-md mb-8">
                                You haven't created any listings yet. Start selling your Roblox assets today and reach thousands of developers.
                            </p>
                            <Link
                                href="/dashboard/seller/listings/new"
                                className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Create First Listing
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
