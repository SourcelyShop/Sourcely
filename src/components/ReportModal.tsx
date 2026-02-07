'use client'

import { useState } from 'react'
import { submitReport } from '@/app/(main)/support/actions'
import { Loader2, Send, Flag, X, AlertTriangle } from 'lucide-react'
import { useFormStatus } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Dropdown } from '@/components/ui/dropdown'
import { Label } from '@/components/ui/label'

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {pending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Flag className="w-4 h-4" />
            )}
            Submit Report
        </button>
    )
}

interface ReportModalProps {
    isOpen: boolean
    onClose: () => void
    reportedUrl: string
    reportedType: 'asset' | 'user'
}

export function ReportModal({ isOpen, onClose, reportedUrl, reportedType }: ReportModalProps) {
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [reason, setReason] = useState('')

    async function clientAction(formData: FormData) {
        setError(null)
        const result = await submitReport(null, formData)
        if (result?.error) {
            setError(result.error)
        } else {
            setSuccess(true)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Report Content
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-green-500/10 border border-green-500/20 rounded-xl p-8 text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 20
                                    }}
                                    className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                                >
                                    <Send className="w-6 h-6 text-green-500" />
                                </motion.div>
                                <h3 className="text-xl font-bold text-white mb-2">Report Submitted</h3>
                                <p className="text-neutral-400 mb-6">
                                    Thank you for helping keep our community safe. Our team will review this report shortly.
                                </p>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-colors"
                                >
                                    Close
                                </button>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                action={clientAction}
                                className="space-y-6"
                            >
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">
                                        {error}
                                    </div>
                                )}

                                <input type="hidden" name="reportedUrl" value={reportedUrl} />
                                <input type="hidden" name="reportedType" value={reportedType} />
                                <input type="hidden" name="reason" value={reason} />

                                <div className="space-y-2">
                                    <Dropdown
                                        label="Reason for reporting"
                                        value={reason}
                                        onChange={setReason}
                                        options={[
                                            { label: 'Copyright Infringement (DMCA)', value: 'DMCA' },
                                            { label: 'Inappropriate Content', value: 'Inappropriate' },
                                            { label: 'Scam / Fraud', value: 'Scam' },
                                            { label: 'Malicious Code', value: 'Malware' },
                                            { label: 'Other', value: 'Other' }
                                        ]}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-white">Description</Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        placeholder="Please provide more details..."
                                        required
                                        rows={4}
                                        className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
                                    />
                                </div>

                                <SubmitButton />
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    )
}
