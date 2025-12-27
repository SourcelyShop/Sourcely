'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

interface StripeOnboardingHandlerProps {
    isConnected: boolean
}

export function StripeOnboardingHandler({ isConnected }: StripeOnboardingHandlerProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const onboarding = searchParams.get('onboarding')

    useEffect(() => {
        if (onboarding === 'complete') {
            if (isConnected) {
                toast.success('Stripe account connected successfully!')
            } else {
                toast.error('Stripe connection incomplete. Please try again.')
            }
            // Clean up the URL
            router.replace('/dashboard/seller')
        } else if (onboarding === 'refresh') {
            toast.error('Stripe connection was not completed.')
            router.replace('/dashboard/seller')
        }
    }, [onboarding, isConnected, router])

    return null
}
