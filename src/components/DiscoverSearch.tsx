'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'

export function DiscoverSearch() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (term) {
            params.set('q', term)
        } else {
            params.delete('q')
        }
        router.push(`/discover?${params.toString()}`)
    }, 300)

    return (
        <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
                defaultValue={searchParams.get('q') || ''}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search for models, scripts, UI..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-black/20 border border-white/10 focus:border-white/30 focus:ring-2 focus:ring-white/10 outline-none transition-all backdrop-blur-md text-white placeholder:text-white/50"
            />
        </div>
    )
}
