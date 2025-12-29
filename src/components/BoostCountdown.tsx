'use client'

import { useEffect, useState } from 'react'
import { Rocket, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export function BoostCountdown({ expiresAt }: { expiresAt: string }) {
    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date()
            const end = new Date(expiresAt)

            if (now >= end) {
                setTimeLeft('Expired')
                return
            }

            const diff = end.getTime() - now.getTime()
            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h left`)
            } else {
                setTimeLeft(`${hours}h ${minutes}m left`)
            }
        }

        updateTimer()
        const interval = setInterval(updateTimer, 60000) // Update every minute
        return () => clearInterval(interval)
    }, [expiresAt])

    if (timeLeft === 'Expired') return null

    return (
        <div className="bg-gradient-to-r from-amber-400/10 to-orange-500/10 border border-amber-400/20 rounded-lg px-3 py-1.5 flex items-center gap-2 text-amber-400 text-sm font-medium">
            <Rocket className="w-4 h-4" />
            <span>Boosted</span>
            <div className="w-1 h-1 rounded-full bg-amber-400/50" />
            <Clock className="w-3 h-3" />
            <span>{timeLeft}</span>
        </div>
    )
}
