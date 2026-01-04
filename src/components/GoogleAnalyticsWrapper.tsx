'use client'

import { GoogleAnalytics } from '@next/third-parties/google'
import { useEffect, useState } from 'react'

export function GoogleAnalyticsWrapper({ gaId }: { gaId: string }) {
    const [consent, setConsent] = useState(false)

    useEffect(() => {
        // Check initial consent
        const storedConsent = localStorage.getItem('cookie-consent')
        if (storedConsent === 'true') {
            setConsent(true)
        }

        // Listen for updates
        const handleConsentUpdate = () => {
            const updatedConsent = localStorage.getItem('cookie-consent')
            setConsent(updatedConsent === 'true')
        }

        window.addEventListener('cookie-consent-update', handleConsentUpdate)

        return () => {
            window.removeEventListener('cookie-consent-update', handleConsentUpdate)
        }
    }, [])

    if (!consent) return null

    return <GoogleAnalytics gaId={gaId} />
}
