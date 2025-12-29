'use client'
import React, { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Camera, Loader2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import { ConfirmationModal } from './ConfirmationModal'

interface AvatarUploadProps {
    userId: string
    currentAvatarUrl: string | null
    editable: boolean
    isPremium?: boolean
}

export function AvatarUpload({ userId, currentAvatarUrl, editable, isPremium }: AvatarUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)

            if (!event.target.files || event.target.files.length === 0) {
                return // User cancelled selection
            }

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const filePath = `${userId}-${Math.random()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            const { error: updateError } = await supabase
                .from('users')
                .update({ avatar_url: publicUrl })
                .eq('id', userId)

            if (updateError) throw updateError

            toast.success('Profile picture updated!')
            router.refresh()
        } catch (error) {
            toast.error('Error uploading avatar')
            console.log(error)
        } finally {
            setUploading(false)
        }
    }

    const handleRemove = async () => {
        try {
            setUploading(true)
            const { error } = await supabase
                .from('users')
                .update({ avatar_url: null })
                .eq('id', userId)

            if (error) throw error

            toast.success('Profile picture removed')
            router.refresh()
        } catch (error) {
            toast.error('Error removing avatar')
            console.log(error)
        } finally {
            setUploading(false)
        }
    }

    return (
        <>
            <div className="relative group">
                <div className={`w-24 h-24 rounded-full overflow-hidden border-2 flex items-center justify-center relative ${isPremium ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]' : 'border-white/20'} bg-neutral-800`}>
                    {currentAvatarUrl ? (
                        <Image
                            src={currentAvatarUrl}
                            alt="Avatar"
                            fill
                            className="object-cover"
                            sizes="96px"
                        />
                    ) : (
                        <div className="text-white/50 text-4xl font-bold">
                            ?
                        </div>
                    )}
                </div>

                {editable && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full gap-2 z-10">
                        <label htmlFor="avatar-upload" className="cursor-pointer p-2 hover:bg-white/10 rounded-full transition-colors" title="Change Picture">
                            {uploading ? (
                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                            ) : (
                                <Camera className="w-5 h-5 text-white" />
                            )}
                            <input
                                type="file"
                                id="avatar-upload"
                                accept="image/*"
                                onChange={handleUpload}
                                disabled={uploading}
                                className="hidden"
                            />
                        </label>

                        {currentAvatarUrl && !uploading && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault()
                                    setIsDeleteModalOpen(true)
                                }}
                                className="p-2 hover:bg-red-500/20 rounded-full transition-colors text-red-400 hover:text-red-300"
                                title="Remove Picture"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleRemove}
                title="Remove Profile Picture"
                message="Are you sure you want to remove your profile picture? This cannot be undone."
                confirmText="Remove"
                isDangerous={true}
            />
        </>
    )
}
