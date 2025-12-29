import Link from 'next/link'
import { Tag, Crown } from 'lucide-react'

import { WishlistButton } from './WishlistButton'

interface AssetListing {
    id: string
    title: string
    price_cents: number
    category: string
    image_url?: string | null
    seller: {
        name: string
        is_premium?: boolean
    }
    stats?: {
        salesCount: number
        upvotes: number
        downvotes: number
    }
    isWishlisted?: boolean
    boost_expires_at?: string | null
}

import { ShoppingCart, ThumbsUp, ThumbsDown, Rocket } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AssetCard({ asset }: { asset: AssetListing }) {
    const isBoosted = asset.boost_expires_at && new Date(asset.boost_expires_at) > new Date()

    return (
        <Link href={`/assets/${asset.id}`} className="group block relative">
            <div className={cn(
                "glass-card rounded-xl overflow-hidden border transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl h-full flex flex-col bg-black/20 backdrop-blur-md relative",
                isBoosted
                    ? "border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.1)] hover:border-amber-400 hover:shadow-[0_0_25px_rgba(251,191,36,0.2)]"
                    : "border-white/10 hover:border-primary/50 hover:shadow-primary/10"
            )}>
                {/* Boosted Badge */}
                {isBoosted && (
                    <div className="absolute top-3 left-3 z-20 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                        <Rocket className="w-3 h-3 fill-black" />
                        BOOSTED
                    </div>
                )}

                {/* Image Area */}
                <div className="aspect-video bg-neutral-900/50 relative overflow-hidden group-hover:brightness-110 transition-all">
                    {asset.image_url ? (
                        <img
                            src={asset.image_url}
                            alt={asset.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/0" />
                    )}
                    <div className="absolute top-3 right-3 z-10">
                        <WishlistButton
                            assetId={asset.id}
                            initialIsWishlisted={!!asset.isWishlisted}
                        />
                    </div>
                    <div className="absolute bottom-3 left-3 flex gap-2">
                        <span className="px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-xs font-medium text-white border border-white/10 flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {asset.category}
                        </span>
                    </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg mb-1 text-white group-hover:text-primary transition-colors line-clamp-1">
                        {asset.title}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-neutral-400 mb-2">
                        <span>by {asset.seller?.name || 'Unknown Seller'}</span>
                        {asset.seller?.is_premium && (
                            <div className="bg-gradient-to-br from-amber-300 to-yellow-600 p-0.5 rounded-full shadow-sm shadow-yellow-500/20" title="Premium Seller">
                                <Crown className="w-3 h-3 text-white fill-white" />
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    {asset.stats && (
                        <div className="flex items-center gap-4 text-xs text-neutral-500 mb-4">
                            <div className="flex items-center gap-1.5">
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>{asset.stats.salesCount} Sales</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <ThumbsUp className="w-3.5 h-3.5" />
                                <span>{asset.stats.upvotes}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <ThumbsDown className="w-3.5 h-3.5" />
                                <span>{asset.stats.downvotes}</span>
                            </div>
                        </div>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="font-bold text-xl text-white tracking-tight">
                            {asset.price_cents === 0 ? 'Free' : `$${(asset.price_cents / 100).toFixed(2)}`}
                        </span>
                        <span className={cn(
                            "text-xs font-semibold px-3 py-1.5 rounded-full transition-transform group-hover:scale-105",
                            isBoosted ? "bg-amber-400 text-black" : "bg-white text-black"
                        )}>
                            Buy Now
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
