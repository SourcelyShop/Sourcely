import React from 'react'
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/animations";
import { DeleteAccountSection } from '@/components/DeleteAccountSection'
import { SubscriptionSettings } from '@/components/SubscriptionSettings'
import { ProfileCustomization } from '@/components/ProfileCustomization'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Fetch user subscription details and profile theme
    const { data: userDetails } = await supabase
        .from('users')
        .select('is_premium, stripe_subscription_id, profile_theme')
        .eq('id', user.id)
        .single()

    return (
        <div className="min-h-screen bg-background py-24 px-4">
            <div className="max-w-2xl mx-auto">
                <FadeIn>
                    <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
                </FadeIn>

                <StaggerContainer className="flex flex-col gap-8">
                    <StaggerItem>
                        <div className="glass-card p-8 rounded-xl border border-white/10">
                            <h2 className="text-xl font-bold text-white mb-4">General</h2>
                            <p className="text-neutral-400">
                                More settings coming soon.
                            </p>
                        </div>
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
