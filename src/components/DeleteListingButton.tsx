'use client'

import { useState } from 'react'
import { ConfirmationModal } from '@/components/ConfirmationModal'
import { scheduleDeletion } from '@/app/(main)/dashboard/seller/listings/actions'

interface DeleteListingButtonProps {
    listingId: string
}

export function DeleteListingButton({ listingId }: DeleteListingButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await scheduleDeletion(listingId)
        } catch (error) {
            console.error('Failed to schedule deletion:', error)
            // Optionally show an error toast here
        } finally {
            setIsDeleting(false)
            setIsModalOpen(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                disabled={isDeleting}
                className="block w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-center rounded-xl border border-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isDeleting ? 'Scheduling Deletion...' : 'Delete Listing'}
            </button>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Listing"
                message="Are you sure you want to delete this listing? It will be scheduled for permanent deletion in 3 days. All buyers will be notified."
                confirmText="Yes, Delete Listing"
                isDangerous={true}
            />
        </>
    )
}
