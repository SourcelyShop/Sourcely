'use client'

import { useState, useEffect } from 'react'
import { Palette, Lock, Upload, Image as ImageIcon, X, Link as LinkIcon, MonitorPlay } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { checkUsernameAvailability } from '@/app/(main)/settings/actions'

interface ProfileCustomizationProps {
    isPremium: boolean
    currentTheme: {
        backgroundColor: string
        backgroundImage?: string
    }
    userId: string
    initialUsername?: string | null
    initialBannerUrl?: string | null
}

const BACKGROUND_OPTIONS = [
    { id: 'default', name: 'Default', value: 'default', class: 'bg-background' },
    { id: 'midnight', name: 'Midnight', value: 'bg-slate-950', class: 'bg-slate-950' },
    { id: 'forest', name: 'Forest', value: 'bg-emerald-950', class: 'bg-emerald-950' },
    { id: 'ocean', name: 'Ocean', value: 'bg-blue-950', class: 'bg-blue-950' },
    { id: 'royal', name: 'Royal', value: 'bg-violet-950', class: 'bg-violet-950' },
    { id: 'sunset', name: 'Sunset', value: 'bg-orange-950', class: 'bg-orange-950' },
    { id: 'gradient', name: 'gradient', value: 'bg-gradient-to-br from-white/5 to-white/0', class: 'bg-gradient-to-br from-white/5 to-white/0' },
    { id: 'gradient2', name: 'gradient2', value: 'bg-gradient-to-br from-white/2 to-black/0', class: 'bg-gradient-to-br from-white/2 to-black/0' },
    { id: 'white', name: 'white', value: 'bg-white', class: 'bg-white' },
]

export function ProfileCustomization({ isPremium, currentTheme, userId, initialUsername, initialBannerUrl }: ProfileCustomizationProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [selectedColor, setSelectedColor] = useState(currentTheme?.backgroundColor || 'default')
    const [username, setUsername] = useState(initialUsername || '')
    const [bannerUrl, setBannerUrl] = useState(initialBannerUrl || '')
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'loading' | 'valid' | 'invalid' | 'taken'>('idle')
    const router = useRouter()
    const supabase = createClient()

    // Debounce check
    useEffect(() => {
        const checkUsername = async () => {
            if (!username || username === initialUsername) {
                setUsernameStatus('idle')
                return
            }

            // Basic validation
            if (username.length < 3 || !/^[a-zA-Z0-9_-]+$/.test(username)) {
                setUsernameStatus('invalid')
                return
            }

            const reservedUsernames = ['login', 'dashboard', 'settings', 'admin', 'api', 'auth', 'premium', 'waitlist', 'assets', 'users', 'legal', 'privacy', 'terms']
            if (reservedUsernames.includes(username.toLowerCase())) {
                setUsernameStatus('taken')
                return
            }

            setUsernameStatus('loading')

            try {
                const isAvailable = await checkUsernameAvailability(username)
                setUsernameStatus(isAvailable ? 'valid' : 'taken')
            } catch (error) {
                console.error('Error checking username:', error)
                setUsernameStatus('valid') // Fallback
            }
        }

        const timeoutId = setTimeout(checkUsername, 500)
        return () => clearTimeout(timeoutId)
    }, [username, initialUsername])

    const handleSave = async () => {
        if (!isPremium) return

        try {
            setIsLoading(true)

            // Validate username if changed
            if (username !== initialUsername) {
                if (username.length < 3) throw new Error('Username must be at least 3 characters')
                if (!/^[a-zA-Z0-9_-]+$/.test(username)) throw new Error('Username can only contain letters, numbers, underscores and hyphens')

                const reservedUsernames = ['login', 'dashboard', 'settings', 'admin', 'api', 'auth', 'premium', 'waitlist', 'assets', 'users', 'legal', 'privacy', 'terms']
                if (reservedUsernames.includes(username.toLowerCase())) throw new Error('This username is reserved')

                // Final availability check
                const isAvailable = await checkUsernameAvailability(username)
                if (!isAvailable) throw new Error('Username is already taken')
            }

            const { error } = await supabase
                .from('users')
                .update({
                    username: username || null,
                    banner_url: bannerUrl || null,
                    profile_theme: {
                        ...currentTheme,
                        backgroundColor: selectedColor,
                        backgroundImage: currentTheme.backgroundImage
                    }
                })
                .eq('id', userId)

            if (error) throw error

            toast.success('Profile updated successfully')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile')
        } finally {
            setIsLoading(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return
        if (!isPremium) return

        try {
            setIsLoading(true)
            const file = e.target.files[0]

            // Basic validation
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('Image must be less than 5MB')
            }
            if (!file.type.startsWith('image/')) {
                throw new Error('File must be an image')
            }

            const fileExt = file.name.split('.').pop()
            const fileName = `${userId}-${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('backgrounds')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('backgrounds')
                .getPublicUrl(filePath)

            // Update User Profile
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    profile_theme: {
                        backgroundColor: 'default', // Reset color when image is used
                        backgroundImage: publicUrl
                    }
                })
                .eq('id', userId)

            if (updateError) throw updateError

            toast.success('Background image uploaded successfully')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Failed to upload image')
        } finally {
            setIsLoading(false)
        }
    }

    const handleRemoveImage = async () => {
        try {
            setIsLoading(true)
            const { error } = await supabase
                .from('users')
                .update({
                    profile_theme: {
                        backgroundColor: 'default',
                        backgroundImage: null
                    }
                })
                .eq('id', userId)

            if (error) throw error

            toast.success('Background image removed')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="glass-card p-8 rounded-xl border border-white/10 mb-8">
            <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-purple-500/10 border border-purple-500/20">
                    <Palette className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-white">Profile Customization</h3>
                        {!isPremium && (
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-medium">
                                <Lock className="w-3 h-3" />
                                Premium Only
                            </div>
                        )}
                    </div>
                    <p className="text-neutral-400 mb-6">
                        Customize your public profile with a unique URL, banner, and theme.
                    </p>

                    <div className="space-y-6">
                        {/* Custom URL */}
                        <div>
                            <label className="text-sm font-medium text-neutral-300 mb-3 flex items-center gap-2">
                                <LinkIcon className="w-4 h-4" />
                                Custom Shop URL
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-neutral-500 text-sm">sourcely.shop/</span>
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="username"
                                        disabled={!isPremium}
                                        className={cn(
                                            "w-full bg-black/20 border rounded-lg px-4 py-2 text-white placeholder:text-neutral-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                                            usernameStatus === 'valid' && "border-green-500/50 focus:border-green-500",
                                            (usernameStatus === 'taken' || usernameStatus === 'invalid') && "border-red-500/50 focus:border-red-500",
                                            usernameStatus === 'loading' && "border-yellow-500/50 focus:border-yellow-500",
                                            usernameStatus === 'idle' && "border-white/10 focus:border-purple-500/50"
                                        )}
                                    />
                                    {usernameStatus === 'loading' && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="w-4 h-4 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="min-h-[20px] mt-2">
                                {usernameStatus === 'taken' && (
                                    <p className="text-xs text-red-400">Username is already taken.</p>
                                )}
                                {usernameStatus === 'invalid' && (
                                    <p className="text-xs text-red-400">
                                        {username.length < 3
                                            ? "Must be at least 3 characters."
                                            : "Only letters, numbers, underscores, and hyphens."}
                                    </p>
                                )}
                                {usernameStatus === 'valid' && username !== initialUsername && (
                                    <p className="text-xs text-green-400">Username is available!</p>
                                )}
                                {usernameStatus === 'idle' && (
                                    <p className="text-xs text-neutral-500">
                                        Only letters, numbers, underscores, and hyphens.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Banner URL */}
                        <div>
                            <label className="text-sm font-medium text-neutral-300 mb-3 flex items-center gap-2">
                                <MonitorPlay className="w-4 h-4" />
                                Profile Banner URL (GIF/Video)
                            </label>
                            <input
                                type="url"
                                value={bannerUrl}
                                onChange={(e) => setBannerUrl(e.target.value)}
                                placeholder="https://media.giphy.com/media/..."
                                disabled={!isPremium}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <p className="text-xs text-neutral-500 mt-2">
                                Paste a direct link to an image (GIF, PNG, JPG) or video (MP4).
                                <br />
                                <span className="text-neutral-600">Note: For Giphy, right-click the GIF and select "Copy Image Link" (should end in .gif).</span>
                            </p>

                            {/* Banner Preview */}
                            {bannerUrl && (
                                <div className="mt-4 rounded-lg overflow-hidden border border-white/10 h-32 relative group">
                                    {bannerUrl.endsWith('.mp4') || bannerUrl.endsWith('.webm') ? (
                                        <video
                                            src={bannerUrl}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <img
                                            src={bannerUrl}
                                            alt="Banner Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none'
                                            }}
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs font-medium text-white">Preview</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Background Color Selection */}
                        <div>
                            <label className="text-sm font-medium text-neutral-300 mb-3 block">
                                Background Color
                            </label>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                {BACKGROUND_OPTIONS.map((option) => (
                                    <div key={option.id} className="relative group/tooltip">
                                        <button
                                            onClick={() => {
                                                if (isPremium) {
                                                    setSelectedColor(option.value)
                                                }
                                            }}
                                            disabled={!isPremium}
                                            className={cn(
                                                "w-full aspect-square rounded-lg border-2 transition-all overflow-hidden relative",
                                                selectedColor === option.value && !currentTheme?.backgroundImage
                                                    ? "border-purple-500 scale-105"
                                                    : "border-white/10 hover:border-white/30",
                                                !isPremium && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            <div className={cn("absolute inset-0", option.class)} />
                                            {selectedColor === option.value && !currentTheme?.backgroundImage && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                    <div className="w-2 h-2 rounded-full bg-white" />
                                                </div>
                                            )}
                                        </button>
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                            {option.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Background Image Upload */}
                        <div className="pt-6 border-t border-white/10">
                            <label className="text-sm font-medium text-neutral-300 mb-3 block">
                                Custom Background Image
                            </label>

                            {currentTheme?.backgroundImage ? (
                                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-white/10 group">
                                    <img
                                        src={currentTheme.backgroundImage}
                                        alt="Current background"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={handleRemoveImage}
                                            disabled={isLoading}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                            Remove Image
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={!isPremium || isLoading}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                                    />
                                    <div className={cn(
                                        "flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed transition-colors",
                                        isPremium
                                            ? "border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5"
                                            : "border-white/5 opacity-50"
                                    )}>
                                        <div className="p-3 rounded-full bg-white/5 mb-2">
                                            <ImageIcon className="w-6 h-6 text-neutral-400" />
                                        </div>
                                        <p className="text-sm text-neutral-400 font-medium">
                                            Click to upload image
                                        </p>
                                        <p className="text-xs text-neutral-500 mt-1">
                                            Max 5MB (JPG, PNG, WEBP)
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Save Button */}
                        {isPremium && (
                            <div className="flex justify-end pt-4 border-t border-white/10">
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading || (username !== initialUsername && usernameStatus !== 'valid')}
                                    className={cn(
                                        "px-6 py-2 bg-purple-500 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2",
                                        (isLoading || (username !== initialUsername && usernameStatus !== 'valid'))
                                            ? "opacity-50 cursor-not-allowed"
                                            : "hover:bg-purple-600"
                                    )}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
