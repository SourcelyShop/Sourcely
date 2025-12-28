'use client'

import { createListing } from '../actions'
import { Upload, DollarSign, Tag, FileText } from 'lucide-react'

export default function NewListingPage() {
    return (
        <div className="min-h-screen bg-background p-20 flex justify-center">
            <div className="max-w-2xl w-full">
                <h1 className="text-3xl font-bold mb-8 text-white text-center">Create New Listing</h1>

                <form action={createListing} className="space-y-8">
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
                                required
                                className="w-full px-4 py-3 rounded-lg bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="e.g., Sci-Fi Weapon Pack"
                            />
                        </div>

                        {/* Category & Price */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-white" htmlFor="category">
                                    Category
                                </label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                                    <select
                                        id="category"
                                        name="category"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                                    >
                                        <option value="">Select...</option>
                                        <option value="MODEL">3D Model</option>
                                        <option value="SCRIPT">Script</option>
                                        <option value="UI">UI Kit</option>
                                        <option value="AUDIO">Audio</option>
                                        <option value="MAP">Map</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-white" htmlFor="price">
                                    Price (USD)
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                                    <input
                                        id="price"
                                        name="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Product Image */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-white" htmlFor="image">
                                Product Image
                            </label>
                            <div className="relative border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-primary/50 transition-colors group">
                                <input
                                    id="image"
                                    name="image"
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center pointer-events-none">
                                    <Upload className="w-10 h-10 text-neutral-400 mb-4 group-hover:text-primary transition-colors" />
                                    <p className="text-sm text-neutral-300 font-medium">
                                        Click or drag to upload cover image
                                    </p>
                                    <p className="text-xs text-neutral-500 mt-1">
                                        PNG, JPG up to 5MB
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
                                required
                                className="w-full px-4 py-3 rounded-lg bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                placeholder="Describe your asset..."
                            />
                        </div>

                        {/* File URL (Placeholder for MVP) */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-white" htmlFor="file_url">
                                Asset Download URL
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                                <input
                                    id="file_url"
                                    name="file_url"
                                    type="url"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="https://..."
                                />
                                <p className="text-xs text-neutral-400 mt-2">
                                    For MVP, please provide a direct download link (e.g., Dropbox, Google Drive).
                                </p>
                            </div>
                        </div>

                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-white hover:bg-white/90 text-black font-bold text-lg rounded-xl shadow-lg shadow-primary/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                        Publish Listing
                    </button>
                </form>
            </div>
        </div>
    )
}
