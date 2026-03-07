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
            <div className="max-w-6xl mx-auto flex flex-col pt-24 px-4 pb-12 w-full">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Seller Dashboard</h1>
                        <p className="text-neutral-400">Manage your listings and earnings</p>
                    </div>
                    <Link
                        href="/dashboard/seller/listings/new"
                        className="flex items-center gap-2 bg-white text-black font-bold px-4 py-2 rounded-lg hover:bg-neutral-200 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New Listing
                    </Link>
                </header>

                {!isStripeConnected && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mb-8 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-yellow-500 mb-1">Payment Setup Required</h3>
                            <p className="text-yellow-500/80 text-sm">Connect your Stripe account to start receiving payouts.</p>
                        </div>
                        <a
                            href="/api/stripe/connect"
                            className="bg-yellow-500 text-black font-semibold px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors"
                        >
                            Connect Stripe
                        </a>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="glass-card p-6 rounded-xl border border-white/10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-green-500/10 rounded-xl">
                                <DollarSign className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-400 mb-1">Total Earnings</p>
                                <h3 className="text-2xl font-bold text-white">${(totalEarningsCents / 100).toFixed(2)}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6 rounded-xl border border-white/10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-500/10 rounded-xl">
                                <Package className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-400 mb-1">Active Listings</p>
                                <h3 className="text-2xl font-bold text-white">{listings?.length || 0}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Boost Credits Card */}
                    <div className="glass-card p-6 rounded-xl border border-white/10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-purple-500/10 rounded-xl">
                                <Rocket className="w-6 h-6 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-400 mb-1">Boost Credits</p>
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
                        <div className="relative overflow-hidden glass-card rounded-2xl border border-white/10 p-12 sm:p-16 flex flex-col items-center justify-center text-center bg-gradient-to-b from-neutral-900/50 to-black/80">
                            {/* Decorative background gradients */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
                            <div className="absolute -top-10 -right-10 w-[200px] h-[200px] bg-black/10 blur-[80px] rounded-full pointer-events-none" />

                            <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.05)] border border-white/5 group-hover:scale-105 transition-transform">
                                <Rocket className="w-12 h-12 text-white" />
                            </div>

                            <h3 className="relative z-10 text-3xl font-bold text-white mb-3 tracking-tight">Your Store is Empty</h3>
                            <p className="relative z-10 text-neutral-400 max-w-lg mb-8 text-lg leading-relaxed">
                                Join hundreds of creators making passive income. List your first Roblox model, script, or UI asset and reach thousands of developers today.
                            </p>

                            <Link
                                href="/dashboard/seller/listings/new"
                                className="relative z-10 px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2 text-lg"
                            >
                                <Plus className="w-6 h-6" />
                                Create First Listing
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
