'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { toggleWishlist } from '@/app/(main)/assets/wishlist-actions'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface WishlistButtonProps {
    assetId: string
    initialIsWishlisted: boolean
    className?: string
}

export function WishlistButton({ assetId, initialIsWishlisted, className }: WishlistButtonProps) {
    const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted)
    const [isPending, startTransition] = useTransition()

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const newState = !isWishlisted
        setIsWishlisted(newState)

        if (newState) {
            toast.success('Added to wishlist')
        } else {
            toast.info('Removed from wishlist')
        }

        startTransition(async () => {
            try {
                await toggleWishlist(assetId)
            } catch (error: any) {
                setIsWishlisted(!newState) // Revert
                toast.error(error.message || 'Failed to update wishlist')
            }
        })
    }

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={cn(
                "p-2 rounded-full transition-all duration-200 hover:scale-110 active:scale-95",
                isWishlisted
                    ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                    : "bg-black/40 text-white/70 hover:bg-black/60 hover:text-white",
                className
            )}
        >
            <Heart
                className={cn(
                    "w-5 h-5 transition-all duration-300",
                    isWishlisted && "fill-current scale-110"
                )}
            />
        </button>
    )
}
