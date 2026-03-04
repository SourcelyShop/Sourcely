'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateSocialAccounts, linkDiscordAccount, unlinkDiscordAccount, verifyRobloxWithBloxlink, unlinkRobloxAccount } from '@/app/(main)/settings/actions'
import { Tooltip } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import { Loader2, Save, Link as LinkIcon, Unlink as UnlinkIcon } from 'lucide-react'
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
    const [isLinkingDiscord, setIsLinkingDiscord] = useState(false)
    const [isUnlinkingDiscord, setIsUnlinkingDiscord] = useState(false)

    // Roblox Bloxlink state
    const [isVerifyingRoblox, setIsVerifyingRoblox] = useState(false)
    const [isUnlinkingRoblox, setIsUnlinkingRoblox] = useState(false)

    const handleUnlinkDiscord = async () => {
        try {
            setIsUnlinkingDiscord(true)
            await unlinkDiscordAccount()
            setFormData(prev => ({ ...prev, discord_handle: '', discord_visible: false }))
            toast.success('Discord account unlinked successfully')
        } catch (error: any) {
            toast.error(error.message || 'Failed to unlink Discord account')
        } finally {
            setIsUnlinkingDiscord(false)
        }
    }

    const handleVerifyRoblox = async () => {
        try {
            setIsVerifyingRoblox(true)
            const res = await verifyRobloxWithBloxlink()
            setFormData(prev => ({ ...prev, roblox_handle: res.username }))
            toast.success('Roblox verified via Bloxlink!')
        } catch (error: any) {
            toast.error(error.message || 'Failed to verify Roblox account')
        } finally {
            setIsVerifyingRoblox(false)
        }
    }

    const handleUnlinkRoblox = async () => {
        try {
            setIsUnlinkingRoblox(true)
            await unlinkRobloxAccount()
            setFormData(prev => ({ ...prev, roblox_handle: '', roblox_visible: false }))
            toast.success('Roblox account unlinked successfully')
        } catch (error: any) {
            toast.error(error.message || 'Failed to unlink Roblox account')
        } finally {
            setIsUnlinkingRoblox(false)
        }
    }

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
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-neutral-400">
                                {formData.discord_visible ? 'Visible on profile' : 'Hidden from profile'}
                            </span>
                            <Switch
                                checked={formData.discord_visible}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, discord_visible: checked }))}
                            />
                            {formData.discord_handle && (
                                <Tooltip content="Unlink Discord account">
                                    <button
                                        type="button"
                                        onClick={handleUnlinkDiscord}
                                        disabled={isUnlinkingDiscord}
                                        className="p-1.5 ml-2 hover:bg-white/10 rounded-md text-neutral-400 hover:text-red-400 transition-colors disabled:opacity-50"
                                    >
                                        {isUnlinkingDiscord ? <Loader2 className="w-4 h-4 animate-spin" /> : <UnlinkIcon className="w-4 h-4" />}
                                    </button>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                    {formData.discord_handle ? (
                        <div className="">
                            <Input
                                id="discord_handle"
                                value={formData.discord_handle}
                                readOnly
                                className="bg-black/50 border-white/10 text-neutral-400 cursor-default focus-visible:ring-0 shadow-none"
                            />
                        </div>
                    ) : (
                        <form action={() => {
                            setIsLinkingDiscord(true)
                            linkDiscordAccount()
                        }}>
                            <button
                                type="submit"
                                disabled={isLinkingDiscord}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#5865F2]/10 border border-[#5865F2]/20 hover:bg-[#5865F2]/20 text-[#5865F2] transition-colors font-medium text-sm disabled:opacity-50"
                            >
                                {isLinkingDiscord ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                                Link Discord Account
                            </button>
                        </form>
                    )}
                </div>

                {/* Roblox */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <RobloxIcon className="w-5 h-5 text-white" />
                            <Label htmlFor="roblox_handle" className="text-white">Roblox</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-neutral-400">
                                {formData.roblox_visible ? 'Visible on profile' : 'Hidden from profile'}
                            </span>
                            <Switch
                                checked={formData.roblox_visible}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, roblox_visible: checked }))}
                            />
                            {formData.roblox_handle && (
                                <Tooltip content="Unlink Roblox account">
                                    <button
                                        type="button"
                                        onClick={handleUnlinkRoblox}
                                        disabled={isUnlinkingRoblox}
                                        className="p-1.5 ml-2 hover:bg-white/10 rounded-md text-neutral-400 hover:text-red-400 transition-colors disabled:opacity-50"
                                    >
                                        {isUnlinkingRoblox ? <Loader2 className="w-4 h-4 animate-spin" /> : <UnlinkIcon className="w-4 h-4" />}
                                    </button>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                    {formData.roblox_handle ? (
                        <div className="">
                            <Input
                                id="roblox_handle"
                                value={formData.roblox_handle}
                                readOnly
                                className="bg-black/50 border-white/10 text-neutral-400 cursor-default focus-visible:ring-0 shadow-none"
                            />
                        </div>
                    ) : (
                        <button
                            type="button"
                            disabled={!formData.discord_handle || isVerifyingRoblox}
                            onClick={handleVerifyRoblox}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-white transition-colors font-medium text-sm disabled:opacity-50"
                        >
                            {isVerifyingRoblox ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                            {!formData.discord_handle ? "Link Discord to verify Roblox" : "Verify via Bloxlink"}
                        </button>
                    )}
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
