'use client'

import { useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { updateName } from '@/app/(main)/settings/actions'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
            <h2 className="text-xl font-bold text-white mb-4">Account Details</h2>
            <p className="text-neutral-400 mb-6">
                Manage your public display name and personal details.
            </p>

            <div className="space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="display_name" className="text-white">Display Name</Label>
                    </div>
                    <Input
                        id="display_name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Name"
                        className="bg-black/50 border-white/10 text-white"
                    />
                </div>
                <div className="pt-4 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isLoading || name === initialName}
                        className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}
