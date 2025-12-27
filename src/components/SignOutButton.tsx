'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export function SignOutButton() {
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    return (
        <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white transition-colors cursor-pointer"
        >
            <LogOut className="w-4 h-4" />
            Sign Out
        </button>
    )
}
