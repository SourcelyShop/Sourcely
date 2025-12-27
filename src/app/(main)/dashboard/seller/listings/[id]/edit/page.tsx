'use client'

import { updateListing } from '../../actions'
import { Upload } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EditListingPage({ params }: { params: { id: string } }) {
    const [listing, setListing] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchListing = async () => {
            const { id } = await params
            const { data, error } = await supabase
                .from('asset_listings')
                .select('*')
                .eq('id', id)
                .single()

            if (error || !data) {
                console.error('Error fetching listing:', error)
                router.push('/dashboard/seller')
                return
            }

            setListing(data)
            setPreviewUrl(data.image_url)
            setLoading(false)
        }

        fetchListing()
    }, [params, router, supabase])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background p-20 flex justify-center items-center">
                <div className="text-white">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-20 flex justify-center">
            <div className="max-w-2xl w-full">
                <h1 className="text-3xl font-bold mb-8 text-white text-center">Edit Listing</h1>

                <form action={updateListing} className="space-y-8">
                    <input type="hidden" name="id" value={listing.id} />

                    <div className="glass-card p-8 rounded-xl border border-white/10 space-y-8">

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-white" htmlFor="title">
                                Asset Title
                            </label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                defaultValue={listing.title}
                                required
                                className="w-full px-4 py-3 rounded-lg bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>

                        {/* Product Image */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-white" htmlFor="image">
                                Product Image (Optional)
                            </label>
                            {previewUrl && (
                                <div className="mb-4">
                                    <p className="text-xs text-neutral-400 mb-2">Image Preview:</p>
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full max-w-md h-48 object-cover rounded-lg border border-white/10"
                                    />
                                </div>
                            )}
                            <div className="relative border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-primary/50 transition-colors group">
                                <input
                                    id="image"
                                    name="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center pointer-events-none">
                                    <Upload className="w-10 h-10 text-neutral-400 mb-4 group-hover:text-primary transition-colors" />
                                    <p className="text-sm text-neutral-300 font-medium">
                                        Click or drag to upload new image
                                    </p>
                                    <p className="text-xs text-neutral-500 mt-1">
                                        Leave empty to keep current image
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-white" htmlFor="description">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                defaultValue={listing.description}
                                required
                                className="w-full px-4 py-3 rounded-lg bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                            />
                        </div>

                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="w-1/3 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-lg rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="w-2/3 py-4 bg-white hover:bg-white/90 text-black font-bold text-lg rounded-xl shadow-lg shadow-primary/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
