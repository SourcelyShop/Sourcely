'use client'

import React, { useRef } from 'react'
import { DownloadIcon, DownloadHandle } from '@/components/DownloadIcon'

interface DownloadButtonProps {
    fileUrl: string
}

export function DownloadButton({ fileUrl }: DownloadButtonProps) {
    const iconRef = useRef<DownloadHandle>(null)

    return (
        <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-4 bg-white hover:bg-neutral-200 text-black font-bold text-center rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            onMouseEnter={() => iconRef.current?.startAnimation()}
            onMouseLeave={() => iconRef.current?.stopAnimation()}
        >
            <DownloadIcon ref={iconRef} className="w-5 h-5" />
            Download Asset
        </a>
    )
}
