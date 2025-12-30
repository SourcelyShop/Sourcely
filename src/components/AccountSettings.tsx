'use client'

import { useState } from 'react'
import { User, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { updateName } from '@/app/(main)/settings/actions'

interface AccountSettingsProps {
    initialName: string
}

export function AccountSettings({ initialName }: AccountSettingsProps) {
    const [name, setName] = useState(initialName)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error('Name cannot be empty')
            return
        }

        if (name === initialName) return

        try {
            setIsLoading(true)
            await updateName(name)
            toast.success('Name updated successfully')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Failed to update name')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="glass-card p-8 rounded-xl border border-white/10">
            <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <User className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">Account Details</h3>
                    <p className="text-neutral-400 mb-6">
                        Manage your public display name and personal details.
                    </p>

                    <div className="space-y-4 max-w-md">
                        <div>
                            <label className="text-sm font-medium text-neutral-300 mb-2 block">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your Name"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-neutral-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={isLoading || name === initialName}
                                className="px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
