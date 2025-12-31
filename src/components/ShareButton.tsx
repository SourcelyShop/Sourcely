'use client'

import { Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ShareButtonProps {
    assetId: string
    className?: string
    iconClassName?: string
}

export function ShareButton({ assetId, className, iconClassName }: ShareButtonProps) {
    const handleShare = (e: React.MouseEvent) => {
        e.preventDefault() // Prevent navigation if inside a Link
        e.stopPropagation() // Prevent bubbling

        const url = `${window.location.origin}/assets/${assetId}`

        navigator.clipboard.writeText(url)
            .then(() => {
                toast.success('Link copied to clipboard!')
            })
            .catch(() => {
                toast.error('Failed to copy link')
            })
    }

    return (
        <button
            onClick={handleShare}
            className={cn(
                "p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors backdrop-blur-md border border-white/10",
                className
            )}
            title="Share Asset"
        >
            <Share2 className={cn("w-4 h-4", iconClassName)} />
        </button>
    )
}
