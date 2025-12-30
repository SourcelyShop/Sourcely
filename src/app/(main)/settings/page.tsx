import React from 'react'
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/animations";
import { DeleteAccountSection } from '@/components/DeleteAccountSection'
import { SubscriptionSettings } from '@/components/SubscriptionSettings'
import { ProfileCustomization } from '@/components/ProfileCustomization'
import { SocialAccountsSettings } from '@/components/SocialAccountsSettings'
import { PreferencesSettings } from '@/components/PreferencesSettings'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

import { AccountSettings } from '@/components/AccountSettings'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch user subscription details and profile theme
    const { data: userDetails } = await supabase
        .from('users')
        .select('name, is_premium, stripe_subscription_id, profile_theme, discord_handle, roblox_handle, discord_visible, roblox_visible, show_new_version_popup, username, banner_url')
        .eq('id', user.id)
        .single()

    return (
        <div className="min-h-screen bg-background py-24 px-8">
            <div className="max-w-3xl mx-auto">
                <FadeIn>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-b from-white/90 to-white/40 tracking-tight drop-shadow-2xl pb-2">Settings</h1>

                </FadeIn>

                <StaggerContainer className="flex flex-col gap-8">
                    <StaggerItem>
                        <AccountSettings initialName={userDetails?.name || ''} />
                    </StaggerItem>

                    <StaggerItem>
                        <SocialAccountsSettings
                            initialData={{
                                discord_handle: userDetails?.discord_handle,
                                roblox_handle: userDetails?.roblox_handle,
                                discord_visible: userDetails?.discord_visible,
                                roblox_visible: userDetails?.roblox_visible,
                            }}
                        />
                    </StaggerItem>

                    <StaggerItem>
                        <PreferencesSettings
                            initialData={{
                                show_new_version_popup: userDetails?.show_new_version_popup ?? true
                            }}
                        />
                    </StaggerItem>

                    <StaggerItem>
                        <SubscriptionSettings
                            isPremium={userDetails?.is_premium || false}
                            subscriptionId={userDetails?.stripe_subscription_id}
                        />
                    </StaggerItem>

                    <StaggerItem>
                        <ProfileCustomization
                            isPremium={userDetails?.is_premium || false}
                            currentTheme={userDetails?.profile_theme || { backgroundColor: 'default' }}
                            userId={user.id}
                            initialUsername={userDetails?.username}
                            initialBannerUrl={userDetails?.banner_url}
                        />
                    </StaggerItem>

                    <StaggerItem>
                        <DeleteAccountSection />
                    </StaggerItem>
                </StaggerContainer>
            </div>
        </div>
    )
}
