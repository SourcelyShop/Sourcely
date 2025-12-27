'use client'

import { useState } from 'react'
import { Edit } from 'lucide-react'
import { EditProfileModal } from './EditProfileModal'

interface ProfileEditButtonProps {
    user: {
        id: string
        name: string
        description?: string | null
        roles?: string[] | null
    }
}

export function ProfileEditButton({ user }: ProfileEditButtonProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-md transition-colors"
                onClick={() => setIsOpen(true)}
            >
                <Edit className="w-4 h-4" />
                Edit Profile
            </button>
            <EditProfileModal user={user} isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    )
}
