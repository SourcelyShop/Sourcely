'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateSocialAccounts } from '@/app/(main)/settings/actions'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import { IconBrandDiscord } from '@tabler/icons-react'

const RobloxIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M5.325 0L0 18.225l18.675 5.775L24 5.775 5.325 0zm10.744 13.225l-3.175 3.175-5.175-5.175 3.175-3.175 5.175 5.175z" />
    </svg>
)

interface SocialAccountsSettingsProps {
    initialData: {
        discord_handle: string | null
        roblox_handle: string | null
        discord_visible: boolean
        roblox_visible: boolean
    }
}

export function SocialAccountsSettings({ initialData }: SocialAccountsSettingsProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        discord_handle: initialData.discord_handle || '',
        roblox_handle: initialData.roblox_handle || '',
        discord_visible: initialData.discord_visible || false,
        roblox_visible: initialData.roblox_visible || false,
    })

    const handleSave = async () => {
        try {
            setIsLoading(true)
            await updateSocialAccounts(formData)
            toast.success('Social accounts updated successfully')
        } catch (error: any) {
            toast.error(error.message || 'Failed to update social accounts')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="glass-card p-8 rounded-xl border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Linked Accounts</h2>
            <p className="text-neutral-400 mb-6">
                Link your social accounts to display them on your profile.
            </p>

            <div className="space-y-6">
                {/* Discord */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <IconBrandDiscord className="w-5 h-5 text-[#5865F2]" />
                            <Label htmlFor="discord_handle" className="text-white">Discord</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-400">
                                {formData.discord_visible ? 'Visible on profile' : 'Hidden from profile'}
                            </span>
                            <Switch
                                checked={formData.discord_visible}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, discord_visible: checked }))}
                            />
                        </div>
                    </div>
                    <Input
                        id="discord_handle"
                        placeholder="username#0000"
                        value={formData.discord_handle}
                        onChange={(e) => setFormData(prev => ({ ...prev, discord_handle: e.target.value }))}
                        className="bg-black/50 border-white/10 text-white"
                    />
                </div>

                {/* Roblox */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <RobloxIcon className="w-5 h-5 text-white" />
                            <Label htmlFor="roblox_handle" className="text-white">Roblox</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-400">
                                {formData.roblox_visible ? 'Visible on profile' : 'Hidden from profile'}
                            </span>
                            <Switch
                                checked={formData.roblox_visible}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, roblox_visible: checked }))}
                            />
                        </div>
                    </div>
                    <Input
                        id="roblox_handle"
                        placeholder="Roblox Username"
                        value={formData.roblox_handle}
                        onChange={(e) => setFormData(prev => ({ ...prev, roblox_handle: e.target.value }))}
                        className="bg-black/50 border-white/10 text-white"
                    />
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
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
