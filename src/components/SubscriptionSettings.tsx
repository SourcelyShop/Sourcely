'use client'

import { useState } from 'react'
import { CreditCard, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Tooltip } from '@/components/ui/tooltip'
import { useRouter } from 'next/navigation'
import { ConfirmationModal } from '@/components/ConfirmationModal'

interface SubscriptionSettingsProps {
    isPremium: boolean
    subscriptionId?: string | null
}

export function SubscriptionSettings({ isPremium, subscriptionId }: SubscriptionSettingsProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const router = useRouter()

    const handleCancel = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/subscribe/cancel', {
                method: 'POST',
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to cancel subscription')
            }

            toast.success('Subscription canceled successfully')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
            setIsModalOpen(false)
        }
    }

    return (
        <>
            <div className="glass-card p-8 rounded-xl border border-white/10 mb-8">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-white/10 border border-white/20">
                        <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">Subscription</h3>
                        <p className="text-neutral-400 mb-6">
                            Manage your premium subscription and billing details.
                        </p>

                        <div className="flex items-center gap-4">
                            {isPremium ? (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg transition-colors font-medium text-sm"
                                >
                                    {isLoading ? 'Canceling...' : 'Cancel Subscription'}
                                </button>
                            ) : (
                                <Tooltip content="You don't have an active subscription yet.">
                                    <button
                                        onClick={() => router.push('/premium')}
                                        className="px-4 py-2 bg-neutral-800 text-neutral-500 border border-white/5 rounded-lg font-medium text-sm hover:bg-neutral-700 hover:text-white transition-colors"
                                    >
                                        Subscribe to Premium
                                    </button>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleCancel}
                title="Cancel Subscription"
                message="Are you sure you want to cancel your premium subscription? You will lose access to premium features at the end of your current billing period."
                confirmText="Cancel Subscription"
                isDangerous={true}
            />
        </>
    )
}
