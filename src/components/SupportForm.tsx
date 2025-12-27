'use client'

import { useState } from 'react'
import { createTicket } from '@/app/(main)/support/actions'
import { Loader2, Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFormStatus } from 'react-dom'
import { motion } from 'framer-motion'

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending}
            className="px-6 bg-white text-black font-bold py-2 rounded-lg hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
            {pending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Send className="w-4 h-4" />
            )}
            Confirm
        </button>
    )
}

import { Dropdown } from '@/components/ui/dropdown'

// ...

export function SupportForm() {
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showConfirm, setShowConfirm] = useState(false)
    const [subject, setSubject] = useState('')

    async function clientAction(formData: FormData) {
        setError(null)
        const result = await createTicket(null, formData)
        if (result?.error) {
            setError(result.error)
        } else {
            setSuccess(true)
            setShowConfirm(false)
        }
    }

    if (success) {
        return (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-8 text-center max-w-md mx-auto">
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
                <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                <p className="text-neutral-400">
                    We have received your message and will get back to you as soon as possible.
                </p>
                <button
                    onClick={() => setSuccess(false)}
                    className="mt-6 text-sm text-green-400 hover:text-green-300 underline"
                >
                    Send another message
                </button>
            </div>
        )
    }

    return (
        <form action={clientAction} className="w-full max-w-md mx-auto space-y-6 bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm relative">
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <label htmlFor="subject" className="block text-sm font-medium text-neutral-300 mb-2">Subject</label>
                <input type="hidden" name="subject" value={subject} />
                <Dropdown
                    label="Select a topic"
                    value={subject}
                    onChange={setSubject}
                    options={[
                        { label: 'Bug Report', value: 'Bug Report' },
                        { label: 'Feature Request', value: 'Feature Request' },
                        { label: 'Account Issue', value: 'Account Issue' },
                        { label: 'Billing', value: 'Billing' },
                        { label: 'Other', value: 'Other' }
                    ]}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="message" className="text-white">Message</Label>
                <textarea
                    id="message"
                    name="message"
                    placeholder="Describe your issue..."
                    required
                    rows={5}
                    className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent"
                />
            </div>

            <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
            >
                <Send className="w-4 h-4" />
                Send Message
            </button>

            {showConfirm && (
                <div className="absolute inset-0 bg-neutral-900/95 backdrop-blur-sm rounded-2xl flex items-center justify-center p-6 z-10">
                    <div className="text-center space-y-4">
                        <h4 className="text-lg font-bold text-white">Confirm Submission</h4>
                        <p className="text-neutral-400 text-sm">
                            The admin team will be contacted. Do you want to continue?
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                type="button"
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 text-neutral-400 hover:text-white transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <div className="w-auto">
                                <SubmitButton />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </form>
    )
}
