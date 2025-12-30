import { createClient, createAdminClient } from '@/utils/supabase/server'
import { formatDistanceToNow } from 'date-fns'
import { notFound, redirect } from 'next/navigation'
import { Tag, ShieldCheck, Download, Crown } from 'lucide-react'
import { DownloadButton } from '@/components/DownloadButton'
import { ShieldCheckIcon } from '@/components/ShieldCheckIcon'
import { ShoppingCartIcon } from '@/components/ShoppingCartIcon'
import Link from 'next/link'
import { WavyBackground } from "@/components/ui/wavy-background";
import { scheduleDeletion, cancelDeletion } from '@/app/(main)/dashboard/seller/listings/actions'
import { claimFreeAsset } from '../actions'
import { DeleteListingButton } from '@/components/DeleteListingButton'

import { WishlistButton } from '@/components/WishlistButton'
import { AssetVoting } from '@/components/AssetVoting'
import { BoostCountdown } from '@/components/BoostCountdown'

import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const supabaseAdmin = await createAdminClient()
    const { id } = await params

    const { data: asset } = await supabaseAdmin
        .from('asset_listings')
        .select('title, description, image_url, seller:users(name)')
        .eq('id', id)
        .single()

    if (!asset) {
        return {
            title: 'Asset Not Found',
        }
    }

    return {
        title: `${asset.title} by ${(asset.seller as any)?.name}`,
        description: asset.description?.slice(0, 160) || `Buy ${asset.title} on Sourcely.`,
        openGraph: {
            title: asset.title,
            description: asset.description?.slice(0, 160),
            images: asset.image_url ? [asset.image_url] : [],
        },
    }
}

export default async function AssetDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const supabase = await createClient()
    const supabaseAdmin = await createAdminClient()
    const { id } = await params; // Await params in Next.js 15+

    const { data: asset } = await supabaseAdmin
        .from('asset_listings')
        .select(`
      *,
      seller:users(name, stripe_account_id, is_premium)
    `)
        .eq('id', id)
        .single()

    if (!asset) notFound()

    const { data: { user } } = await supabase.auth.getUser()

    // Check if user has already purchased
    const PLATFORM_COMMISSION_RATE = 0.2 // 20% commission rate

    let hasPurchased = false
    let owner = false
    let isWishlisted = false

    if (user) {
        const { data: order } = await supabase
            .from('orders')
            .select('id')
            .eq('buyer_id', user.id)
            .eq('listing_id', asset.id)
            .eq('status', 'complete') // Assuming 'complete' status
            .single()

        if (order) hasPurchased = true

        // Also check if user is the seller
        if (asset.seller_id === user.id) {
            owner = true
            hasPurchased = true
        }

        const { data: wishlistData } = await supabase
            .from('wishlist')
            .select('id')
            .eq('user_id', user.id)
            .eq('asset_id', asset.id)
            .single()

        isWishlisted = !!wishlistData
    }

    // Fetch sales count
    const { count: salesCount } = await supabaseAdmin
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('listing_id', asset.id)
        .eq('status', 'complete')

    // Fetch Votes
    const { count: upvotes } = await supabaseAdmin
        .from('asset_votes')
        .select('*', { count: 'exact', head: true })
        .eq('asset_id', asset.id)
        .eq('vote_type', 'up')

    const { count: downvotes } = await supabaseAdmin
        .from('asset_votes')
        .select('*', { count: 'exact', head: true })
        .eq('asset_id', asset.id)
        .eq('vote_type', 'down')

    let currentUserVote = null
    if (user) {
        const { data } = await supabase
            .from('asset_votes')
            .select('vote_type')
            .eq('voter_id', user.id)
            .eq('asset_id', asset.id)
            .single()
        currentUserVote = data
    }

    return (
        <div className="relative min-h-screen w-full">
            <div className="absolute inset-0 -z-10">
                <WavyBackground className="max-w-4xl mx-auto pb-40"></WavyBackground>
            </div>

            <div className="relative z-10 flex flex-col pt-24 px-4">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">

                    {/* Left: Image/Preview */}
                    <div className="space-y-6">
                        <div className="aspect-video bg-secondary/50 rounded-2xl border border-white/10 relative overflow-hidden flex items-center justify-center backdrop-blur-sm group">
                            {asset.image_url ? (
                                <img
                                    src={asset.image_url}
                                    alt={asset.title}
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                />
                            ) : (
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-black/20" />
                                    <Tag className="w-20 h-20 text-white/20" />
                                </>
                            )}
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass-card p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center bg-black/20">
                                <span className="text-3xl font-bold text-white mb-1">{salesCount || 0}</span>
                                <span className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Total Sales</span>
                            </div>
                            <div className="glass-card p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center text-center bg-black/20">
                                <AssetVoting
                                    assetId={asset.id}
                                    initialVote={currentUserVote?.vote_type as 'up' | 'down' | null}
                                    upvotes={upvotes || 0}
                                    downvotes={downvotes || 0}
                                    isOwner={owner}
                                    hasPurchased={hasPurchased}
                                />
                                <span className="text-xs text-neutral-400 uppercase tracking-wider font-medium mt-2">Rating</span>
                            </div>
                        </div>

                        {owner && (
                            <div className="space-y-3">
                                <Link
                                    href={`/dashboard/seller/listings/${asset.id}/edit`}
                                    className="block w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-center rounded-xl border border-white/20 transition-all"
                                >
                                    Edit Listing
                                </Link>

                                {asset.deletion_scheduled_at ? (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                                        <p className="text-red-400 font-medium mb-2">
                                            Scheduled for deletion {formatDistanceToNow(new Date(asset.deletion_scheduled_at), { addSuffix: true })}
                                        </p>
                                        <form action={cancelDeletion.bind(null, asset.id)}>
                                            <button
                                                type="submit"
                                                className="text-sm text-white underline hover:text-red-400 transition-colors"
                                            >
                                                Undo Deletion
                                            </button>
                                        </form>
                                    </div>
                                ) : (
                                    <DeleteListingButton listingId={asset.id} />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: Details */}
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 rounded-full bg-white/10 text-white text-sm font-medium border border-white/10 backdrop-blur-md">
                                    {asset.category}
                                </span>
                                {asset.boost_expires_at && new Date(asset.boost_expires_at) > new Date() && (
                                    <BoostCountdown expiresAt={asset.boost_expires_at} />
                                )}
                            </div>
                            <h1 className="text-5xl font-bold mb-2 text-white drop-shadow-lg tracking-tight">{asset.title}</h1>
                            <p className="text-lg text-neutral-300 flex items-center gap-2">
                                Created by
                                <Link href={`/users/${asset.seller_id}`} className="text-white font-semibold hover:text-primary transition-colors underline decoration-white/30 underline-offset-4 flex items-center gap-1">
                                    {asset.seller?.name || 'Unknown'}
                                    {asset.seller?.is_premium && (
                                        <span className="bg-gradient-to-br from-amber-300 to-yellow-600 p-0.5 rounded-full shadow-sm shadow-yellow-500/20 flex items-center justify-center" title="Premium Seller">
                                            <Crown className="w-3 h-3 text-white fill-white" />
                                        </span>
                                    )}
                                    {/*<ShieldCheck className="w-4 h-4 text-blue-400 fill-blue-400/20" />*/}
                                </Link>
                            </p>
                        </div>

                        <div className="glass-card p-8 rounded-2xl border border-white/10 space-y-8 bg-neutral-900/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">


                            <div className="flex items-end justify-between pb-6 border-b border-white/5 relative z-10">
                                <div>
                                    <p className="text-sm text-neutral-400 font-medium mb-1 uppercase tracking-wider">Price</p>
                                    <p className="text-5xl font-bold text-white tracking-tight">${(asset.price_cents / 100).toFixed(2)}</p>
                                </div>
                                {!owner && (
                                    <WishlistButton
                                        assetId={asset.id}
                                        initialIsWishlisted={isWishlisted}
                                        className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10"
                                    />
                                )}
                            </div>
                            {owner && (
                                <div className="flex items-end justify-between relative z-10">
                                    <div>
                                        <p className="text-sm text-neutral-400 mb-1">Estimated Value ${(asset.price_cents / 100) - (Math.round(asset.price_cents * PLATFORM_COMMISSION_RATE) / 100)}</p>

                                    </div>
                                </div>
                            )}

                            {/* Deletion Warning for All Users */}
                            {asset.deletion_scheduled_at && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 relative z-10">
                                    <ShieldCheck className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="text-red-400 font-semibold mb-1">Scheduled for Deletion</h4>
                                        <p className="text-sm text-red-400/80">
                                            This asset will be permanently removed on {new Date(asset.deletion_scheduled_at).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' }).replace(/\./g, '. ')} at {new Date(asset.deletion_scheduled_at).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}.
                                            {hasPurchased ? ' Please download your files immediately.' : ' Purchasing is no longer available.'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {hasPurchased ? (
                                <div className="space-y-4 relative z-10">
                                    <div className="bg-green-500/20 text-green-400 p-4 rounded-xl flex items-center gap-3 border border-green-500/30">
                                        <ShieldCheckIcon className="w-6 h-6" />
                                        <span className="font-semibold">You own this asset</span>
                                    </div>
                                    <DownloadButton fileUrl={asset.file_url} />
                                </div>
                            ) : (
                                asset.deletion_scheduled_at ? (
                                    <button
                                        disabled
                                        className="w-full py-4 bg-neutral-800 text-neutral-500 font-bold text-xl rounded-xl border border-white/5 cursor-not-allowed relative z-10"
                                    >
                                        Discontinued
                                    </button>
                                ) : (
                                    asset.price_cents === 0 ? (
                                        <form action={async () => {
                                            'use server'
                                            await claimFreeAsset(asset.id)
                                        }}>
                                            <button
                                                type="submit"
                                                className="w-full py-4 bg-white text-black font-bold text-xl rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/50"
                                            >
                                                Get for Free
                                            </button>
                                            <p className="text-center text-xs text-neutral-400 mt-4">
                                                Instant addition to your library
                                            </p>
                                        </form>
                                    ) : (
                                        <form action="/api/checkout" method="POST" className="relative z-10">
                                            <input type="hidden" name="listingId" value={asset.id} />
                                            <button
                                                type="submit"
                                                className="w-full py-4 bg-gradient-to-r from-white to-neutral-200 hover:from-neutral-100 hover:to-neutral-300 text-black font-bold text-xl rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/50"
                                            >
                                                Buy Now
                                            </button>


                                            <div className="mt-6 space-y-4">
                                                <div className="flex items-center justify-center gap-2 text-sm text-neutral-400">
                                                    <img
                                                        src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg"
                                                        alt="Stripe"
                                                        className="h-6 opacity-90 hover:opacity-100 transition-opacity"
                                                        style={{ filter: 'brightness(0) invert(1)' }}
                                                    />
                                                    <span className="translate-y-[1px]">Secure payment via Stripe</span>
                                                </div>

                                                <div className="flex justify-center gap-6 text-xs text-neutral-500 border-t border-white/5 pt-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <ShieldCheck className="w-3.5 h-3.5" />
                                                        <span>Encrypted</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Download className="w-3.5 h-3.5" />
                                                        <span>Instant Delivery</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Tag className="w-3.5 h-3.5" />
                                                        <span>Verified Asset</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    )
                                )
                            )}

                            <div className="pt-6 border-t border-white/5">
                                <h3 className="text-lg font-semibold mb-3 text-white">Description</h3>
                                <div className="prose prose-invert max-w-none text-neutral-300 leading-relaxed">
                                    <p>{asset.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
