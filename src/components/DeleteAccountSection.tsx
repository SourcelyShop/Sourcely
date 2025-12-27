'use client'

import { useState, useRef } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import { ConfirmationModal } from '@/components/ConfirmationModal'
import { deleteAccount } from '@/app/(main)/settings/actions'
import { toast } from 'sonner'
import { Tooltip } from '@/components/ui/tooltip'
import { TrashIcon, type DashboardIconHandle } from './TrashIcon'

export function DeleteAccountSection() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const trashIconRef = useRef<DashboardIconHandle>(null)

    const handleDelete = async () => {
        try {
            setIsDeleting(true)
            await deleteAccount()
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete account. Please try again.')
            setIsDeleting(false)
        }
    }

    return (
        <>
            <div className="glass-card p-8 rounded-xl border border-red-500/20 bg-red-500/5 mt-8">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">Delete Account</h3>
                        <p className="text-neutral-400 mb-6">
                            Permanently delete your account and all of your content. This action cannot be undone.
                        </p>
                        <Tooltip content="Warning: This action is permanent!">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                onMouseEnter={() => trashIconRef.current?.startAnimation()}
                                onMouseLeave={() => trashIconRef.current?.stopAnimation()}
                                disabled={isDeleting}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg transition-colors font-medium"
                            >
                                <TrashIcon ref={trashIconRef} className="w-4 h-4" />
                                {isDeleting ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </Tooltip>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Account"
                message="Are you absolutely sure you want to delete your account? This will permanently remove your profile, listings, and data. This action cannot be undone."
                confirmText="Delete Account"
                isDangerous={true}
            />
        </>
    )
}
