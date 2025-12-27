'use client'

import { useState, useTransition } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { voteProfile } from '@/app/(main)/users/[id]/actions'
import { cn } from '@/lib/utils'

interface ProfileVotingProps {
    targetUserId: string
    initialVote: 'up' | 'down' | null
    upvotes: number
    downvotes: number
    isOwnProfile: boolean
}

export function ProfileVoting({
    targetUserId,
    initialVote,
    upvotes: initialUpvotes,
    downvotes: initialDownvotes,
    isOwnProfile
}: ProfileVotingProps) {
    const [vote, setVote] = useState<'up' | 'down' | null>(initialVote)
    const [upvotes, setUpvotes] = useState(initialUpvotes)
    const [downvotes, setDownvotes] = useState(initialDownvotes)
    const [isPending, startTransition] = useTransition()

    const handleVote = (type: 'up' | 'down') => {
        if (isOwnProfile) return // Prevent self-voting in UI

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
                await voteProfile(targetUserId, type)
            } catch (error) {
                // Revert on error
                setVote(previousVote)
                setUpvotes(previousUpvotes)
                setDownvotes(previousDownvotes)
                console.error('Failed to vote:', error)
            }
        })
    }

    return (
        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md rounded-full p-1 border border-white/10">
            <button
                onClick={() => handleVote('up')}
                disabled={isPending || isOwnProfile}
                className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200",
                    vote === 'up'
                        ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        : "text-muted-foreground hover:bg-white/5 hover:text-white",
                    isOwnProfile && "opacity-50 cursor-not-allowed"
                )}
            >
                <ThumbsUp className={cn("w-4 h-4 text-white", vote === 'up' && "fill-current")} />
                <span className="text-white font-medium">{upvotes}</span>
            </button>

            <div className="w-px h-4 bg-white/10" />

            <button
                onClick={() => handleVote('down')}
                disabled={isPending || isOwnProfile}
                className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200",
                    vote === 'down'
                        ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        : "text-muted-foreground hover:bg-white/5 hover:text-white",
                    isOwnProfile && "opacity-50 cursor-not-allowed"
                )}
            >
                <ThumbsDown className={cn("w-4 h-4 text-white", vote === 'down' && "fill-current")} />
                <span className="text-white font-medium">{downvotes}</span>
            </button>
        </div>
    )
}
