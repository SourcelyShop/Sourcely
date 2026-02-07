'use client'

import { useState } from 'react'
import { Flag } from 'lucide-react'
import { ReportModal } from '@/components/ReportModal'

interface ReportButtonProps {
    reportedUrl: string
    reportedType: 'asset' | 'user'
    className?: string
}

export function ReportButton({ reportedUrl, reportedType, className }: ReportButtonProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={className || "text-neutral-400 hover:text-red-400 transition-colors flex items-center gap-2 text-sm"}
            >
                <Flag className="w-4 h-4" />
                Report
            </button>

            <ReportModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                reportedUrl={reportedUrl}
                reportedType={reportedType}
            />
        </>
    )
}
