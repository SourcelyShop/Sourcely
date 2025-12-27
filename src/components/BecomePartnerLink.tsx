'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { MoveRightIcon, MoveRightIconHandle } from '@/components/MoveRightIcon'

export function BecomePartnerLink() {
    const iconRef = useRef<MoveRightIconHandle>(null)

    return (
        <Link
            href="/contact"
            className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2"
            onMouseEnter={() => iconRef.current?.startAnimation()}
            onMouseLeave={() => iconRef.current?.stopAnimation()}
        >
            Become a Partner <MoveRightIcon ref={iconRef} className="w-4 h-4" />
        </Link>
    )
}
