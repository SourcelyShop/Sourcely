'use client'

import { useState, useTransition } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { voteAsset } from '@/app/(main)/assets/[id]/actions'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/ui/tooltip'

interface AssetVotingProps {
    assetId: string
    initialVote: 'up' | 'down' | null
    upvotes: number
    downvotes: number
    isOwner: boolean
    hasPurchased: boolean
}

export function AssetVoting({
    assetId,
    initialVote,
    upvotes: initialUpvotes,
    downvotes: initialDownvotes,
    isOwner,
    hasPurchased
}: AssetVotingProps) {
    const [vote, setVote] = useState<'up' | 'down' | null>(initialVote)
    const [upvotes, setUpvotes] = useState(initialUpvotes)
    const [downvotes, setDownvotes] = useState(initialDownvotes)
    const [isPending, startTransition] = useTransition()

    const handleVote = (type: 'up' | 'down') => {
        if (isOwner) return
        if (!hasPurchased) return

        const previousVote = vote
        const previousUpvotes = upvotes
        const previousDownvotes = downvotes

        // Optimistic Update
        if (vote === type) {
            // Toggle off
            setVote(null)
            if (type === 'up') setUpvotes(prev => prev - 1)
            else setDownvotes(prev => prev - 1)
        } else {
            // Change vote or new vote
            setVote(type)
            if (type === 'up') {
                setUpvotes(prev => prev + 1)
                if (previousVote === 'down') setDownvotes(prev => prev - 1)
            } else {
                setDownvotes(prev => prev + 1)
                if (previousVote === 'up') setUpvotes(prev => prev - 1)
            }
        }

        startTransition(async () => {
            try {
                await voteAsset(assetId, type)
            } catch (error) {
                // Revert on error
                setVote(previousVote)
                setUpvotes(previousUpvotes)
                setDownvotes(previousDownvotes)
                console.error('Failed to vote:', error)
            }
        })
    }

    const isDisabled = isPending || isOwner || !hasPurchased

    const content = (
        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-full p-1 border border-white/10">
            <button
                onClick={() => handleVote('up')}
                disabled={isDisabled}
                className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200",
                    isDisabled ? "opacity-50 cursor-not-allowed" : "",
                    vote === 'up'
                        ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
            >
                <ThumbsUp className={cn("w-4 h-4 text-white", vote === 'up' && "fill-current")} />
                <span className="text-white font-medium">{upvotes}</span>
            </button>

            <div className="w-px h-4 bg-white/10" />

            <button
                onClick={() => handleVote('down')}
                disabled={isDisabled}
                className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200",
                    isDisabled ? "opacity-50 cursor-not-allowed" : "",
                    vote === 'down'
                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
            >
                <ThumbsDown className={cn("w-4 h-4 text-white", vote === 'down' && "fill-current")} />
                <span className="text-white font-medium">{downvotes}</span>
            </button>
        </div>
    )

    if (!hasPurchased && !isOwner) {
        return (
            <Tooltip content="You must buy the asset to vote ">
                {content}
            </Tooltip>
        )
    }

    return content
}
