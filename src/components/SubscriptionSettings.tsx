'use client'

import { useState } from 'react'
import { CreditCard, AlertTriangle, Receipt, Wallet, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Tooltip } from '@/components/ui/tooltip'
import { useRouter } from 'next/navigation'
import { ConfirmationModal } from '@/components/ConfirmationModal'

interface SubscriptionSettingsProps {
    isPremium: boolean
    subscriptionId?: string | null
    stripeCustomerId?: string | null
    stripeAccountId?: string | null
}

export function SubscriptionSettings({ isPremium, subscriptionId, stripeCustomerId, stripeAccountId }: SubscriptionSettingsProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [isPortalLoading, setIsPortalLoading] = useState(false)
    const [isExpressLoading, setIsExpressLoading] = useState(false)
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

    const openCustomerPortal = async () => {
        try {
            setIsPortalLoading(true)
            const response = await fetch('/api/stripe/customer-portal', { method: 'POST' })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Failed to open portal')
            window.location.href = data.url
        } catch (error: any) {
            toast.error(error.message)
            setIsPortalLoading(false)
        }
    }

    const openExpressDashboard = async () => {
        try {
            setIsExpressLoading(true)
            const response = await fetch('/api/stripe/express-dashboard', { method: 'POST' })
            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Failed to open dashboard')
            window.location.href = data.url
        } catch (error: any) {
            toast.error(error.message)
            setIsExpressLoading(false)
        }
    }

    return (
        <>
            <div className="glass-card p-8 rounded-xl border border-white/10 mb-8">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                        <CreditCard className="w-6 h-6 text-yellow-500" />
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

                        {/* Separate section for Portals if applicable */}
                        {(stripeCustomerId || stripeAccountId) && (
                            <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                                {stripeCustomerId && (
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/20 rounded border border-blue-500/30">
                                                <Receipt className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-white">Manage Billing</h4>
                                                <p className="text-xs text-neutral-400">Update payment methods and view past receipts.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={openCustomerPortal}
                                            disabled={isPortalLoading}
                                            className="px-4 py-2 flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            {isPortalLoading ? <Loader2 className="w-4 h-4 animate-spin text-neutral-400" /> : <ExternalLink className="w-4 h-4" />}
                                            {isPortalLoading ? 'Loading...' : 'Open Portal'}
                                        </button>
                                    </div>
                                )}

                                {stripeAccountId && (
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-green-500/5 border border-green-500/10 hover:border-green-500/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-500/20 rounded border border-green-500/30">
                                                <Wallet className="w-5 h-5 text-green-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-white">Seller Payouts</h4>
                                                <p className="text-xs text-neutral-400">View earnings, tax forms, and withdraw funds.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={openExpressDashboard}
                                            disabled={isExpressLoading}
                                            className="px-4 py-2 flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            {isExpressLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                                            {isExpressLoading ? 'Loading...' : 'Open Dashboard'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
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
