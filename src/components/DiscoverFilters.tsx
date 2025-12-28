'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

const CATEGORIES = ['MODEL', 'SCRIPT', 'UI', 'AUDIO', 'MAP']
const PRICES = [
    { label: 'All', value: 'all' },
    { label: 'Free', value: 'free' },
    { label: 'Paid', value: 'paid' },
]
const SORTS = [
    { label: 'Newest', value: 'newest' },
    { label: 'Popular', value: 'popular' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
]

export function DiscoverFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentCategory = searchParams.get('category')
    const currentPrice = searchParams.get('price') || 'all'
    const currentSort = searchParams.get('sort') || 'newest'

    const updateParams = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== 'all') {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`/discover?${params.toString()}`)
    }

    const clearFilters = () => {
        router.push('/discover')
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Filters</h3>
                {(currentCategory || currentPrice !== 'all' || currentSort !== 'newest') && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 px-2"
                    >
                        <X className="w-3 h-3 mr-1" />
                        Clear
                    </Button>
                )}
            </div>

            {/* Categories */}
            <div className="space-y-3">
                <Label className="text-neutral-400 text-xs uppercase tracking-wider font-bold">Category</Label>
                <div className="space-y-2">
                    <div
                        className={`cursor-pointer px-3 py-2 rounded-lg text-sm transition-colors ${!currentCategory ? 'bg-white/10 text-white font-medium' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
                        onClick={() => updateParams('category', null)}
                    >
                        All Categories
                    </div>
                    {CATEGORIES.map((cat) => (
                        <div
                            key={cat}
                            className={`cursor-pointer px-3 py-2 rounded-lg text-sm transition-colors ${currentCategory === cat ? 'bg-white/10 text-white font-medium' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
                            onClick={() => updateParams('category', cat)}
                        >
                            {cat}
                        </div>
                    ))}
                </div>
            </div>

            {/* Price */}
            <div className="space-y-3">
                <Label className="text-neutral-400 text-xs uppercase tracking-wider font-bold">Price</Label>
                <RadioGroup value={currentPrice} onValueChange={(val) => updateParams('price', val)}>
                    {PRICES.map((price) => (
                        <div key={price.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={price.value} id={`price-${price.value}`} className="border-white/20 text-white" />
                            <Label htmlFor={`price-${price.value}`} className="text-neutral-300 cursor-pointer">{price.label}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            {/* Sort */}
            <div className="space-y-3">
                <Label className="text-neutral-400 text-xs uppercase tracking-wider font-bold">Sort By</Label>
                <Select value={currentSort} onValueChange={(val) => updateParams('sort', val)}>
                    <SelectTrigger className="w-full bg-black/20 border-white/10 text-white">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-white/10 text-white">
                        {SORTS.map((sort) => (
                            <SelectItem key={sort.value} value={sort.value} className="focus:bg-white/10 focus:text-white cursor-pointer">
                                {sort.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
