'use client'

import { useState } from 'react'
import { Rocket } from 'lucide-react'
import { toast } from 'sonner'
import { applyBoost } from '@/app/(main)/dashboard/seller/actions'
import { cn } from '@/lib/utils'

interface BoostButtonProps {
    assetId: string
    hasCredits: boolean
    isBoosted: boolean
    boostExpiresAt?: string | null
}

export function BoostButton({ assetId, hasCredits, isBoosted, boostExpiresAt }: BoostButtonProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handleBoost = async () => {
        if (!hasCredits) {
            toast.error('No boost credits available')
            return
        }

        try {
            setIsLoading(true)
            await applyBoost(assetId)
            toast.success('Asset boosted successfully! It will appear at the top for 7 days.')
        } catch (error: any) {
            toast.error(error.message || 'Failed to boost asset')
        } finally {
            setIsLoading(false)
        }
    }

    if (isBoosted && boostExpiresAt) {
        const daysLeft = Math.ceil((new Date(boostExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium">
                <Rocket className="w-3 h-3" />
                Boosted ({daysLeft}d left)
            </div>
        )
    }

    return (
        <button
            onClick={handleBoost}
            disabled={!hasCredits || isLoading}
            className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                hasCredits
                    ? "bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/40 cursor-pointer"
                    : "bg-neutral-800/50 border-white/5 text-neutral-500 cursor-not-allowed"
            )}
            title={!hasCredits ? "No boost credits available" : "Boost this asset"}
        >
            <Rocket className={cn("w-3 h-3", isLoading && "animate-pulse")} />
            {isLoading ? 'Boosting...' : 'Boost'}
        </button>
    )
}
