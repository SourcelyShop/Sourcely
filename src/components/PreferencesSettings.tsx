'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { updatePreferences } from '@/app/(main)/settings/actions'
import { Sparkles } from 'lucide-react'

interface PreferencesSettingsProps {
    initialData: {
        show_new_version_popup: boolean
    }
}

export function PreferencesSettings({ initialData }: PreferencesSettingsProps) {
    const [showPopup, setShowPopup] = useState(initialData.show_new_version_popup)
    const [isLoading, setIsLoading] = useState(false)

    const handleToggle = async (checked: boolean) => {
        setIsLoading(true)
        // Optimistic update
        setShowPopup(checked)

        try {
            await updatePreferences({
                show_new_version_popup: checked
            })
            toast.success('Preferences updated')
        } catch (error) {
            // Revert on error
            setShowPopup(!checked)
            toast.error('Failed to update preferences')
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="glass-card p-8 rounded-xl border border-white/10 bg-neutral-900/50">
            <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-purple-500/10 border border-purple-500/20">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-white">Preferences</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-base text-white font-medium">New Version Popup</Label>
                                <p className="text-sm text-neutral-400">
                                    Show a popup when a new version of Sourcely is released
                                </p>
                            </div>
                            <span className="text-xs text-neutral-400">
                                {showPopup ? 'Enabled' : 'Disabled'}
                            </span>
                            <Switch
                                checked={showPopup}
                                onCheckedChange={handleToggle}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
