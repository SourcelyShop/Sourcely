'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { replyToTicket, closeTicket, reopenTicket } from '@/app/(main)/support/actions'
import { getAdminTicketDetails } from '@/app/(main)/dashboard/admin/actions'
import { Loader2, Send, ArrowLeft, User, Shield, AlertTriangle, X, Check } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { useParams } from 'next/navigation'

interface Message {
    id: string
    message: string
    created_at: string
    is_admin_reply: boolean
    sender: {
        name: string
        avatar_url: string
    }
}

interface Ticket {
    id: string
    subject: string
    status: string
    closure_reason?: string
    closed_at?: string
    scheduled_deletion_at?: string
    user: {
        id: string
        name: string
        email: string
    }
}

export default function TicketDetailPage() {
    const params = useParams()
    const id = params.id as string
    const [ticket, setTicket] = useState<Ticket | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [reply, setReply] = useState('')
    const [sending, setSending] = useState(false)

    // Close/Reopen State
    const [showCloseModal, setShowCloseModal] = useState(false)
    const [closeReason, setCloseReason] = useState('')
    const [processingAction, setProcessingAction] = useState(false)

    const supabase = createClient()
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchData()

        // Subscribe to new messages
        const channel = supabase
            .channel(`ticket-${id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'support_messages',
                    filter: `ticket_id=eq.${id}`
                },
                (payload) => {
                    console.log('Admin: New message received:', payload)
                    fetchData()
                }
            )
            .subscribe((status) => {
                console.log('Admin: Subscription status:', status)
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [id])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const fetchData = async () => {
        const data = await getAdminTicketDetails(id)
        if (data) {
            setTicket(data.ticket)
            setMessages(data.messages)
        }
        setLoading(false)
    }

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!reply.trim()) return

        setSending(true)
        await replyToTicket(id, reply)
        await fetchData()
        setReply('')
        setSending(false)
    }

    const handleCloseTicket = async () => {
        if (!closeReason.trim()) return
        setProcessingAction(true)
        await closeTicket(id, closeReason)
        setProcessingAction(false)
        setShowCloseModal(false)
        fetchData()
    }

    const handleReopenTicket = async () => {
        setProcessingAction(true)
        await reopenTicket(id)
        setProcessingAction(false)
        fetchData()
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black/95 p-8 pt-24 relative">
                <div className="max-w-4xl mx-auto h-[calc(100vh-150px)] flex flex-col">
                    {/* Header Skeleton */}
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-9 w-9 rounded-full" />
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Skeleton className="h-8 w-64" />
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                        <Skeleton className="h-10 w-32 rounded-lg" />
                    </div>

                    {/* Messages Skeleton */}
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col">
                        <div className="flex-1 p-6 space-y-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className={`flex gap-4 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                                    {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                                    <div className={`max-w-[80%] space-y-2 ${i % 2 !== 0 ? 'items-end flex flex-col' : ''}`}>
                                        <Skeleton className="h-3 w-32" />
                                        <Skeleton className={`h-24 w-64 rounded-2xl ${i % 2 !== 0 ? 'rounded-tr-none' : 'rounded-tl-none'}`} />
                                    </div>
                                    {i % 2 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-white/10 bg-black/20">
                            <div className="flex gap-3">
                                <Skeleton className="flex-1 h-12 rounded-lg" />
                                <Skeleton className="h-12 w-24 rounded-lg" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!ticket) return <div>Ticket not found</div>

    return (
        <div className="min-h-screen bg-black/95 p-8 pt-24 relative">
            {/* Close Ticket Modal */}
            {showCloseModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 max-w-md w-full space-y-4">
                        <h3 className="text-xl font-bold text-white">Close Ticket</h3>
                        <p className="text-neutral-400 text-sm">
                            Please provide a reason for closing this ticket. It will be scheduled for deletion in 3 days.
                        </p>
                        <textarea
                            value={closeReason}
                            onChange={(e) => setCloseReason(e.target.value)}
                            placeholder="Reason for closing..."
                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            rows={3}
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowCloseModal(false)}
                                className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCloseTicket}
                                disabled={!closeReason.trim() || processingAction}
                                className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {processingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                Close Ticket
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto h-[calc(100vh-150px)] flex flex-col">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/admin/support" className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                                {ticket.subject}
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${ticket.status === 'open' ? 'bg-green-500/20 text-green-400' :
                                    ticket.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-red-500/20 text-red-400'
                                    }`}>
                                    {ticket.status.toUpperCase().replace('_', ' ')}
                                </span>
                            </h1>
                            <p className="text-neutral-400 text-sm">
                                by <Link href={`/users/${ticket.user?.id || ''}`} className="hover:text-white underline transition-colors">{ticket.user?.name}</Link> ({ticket.user?.email})
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div>
                        {ticket.status !== 'closed' ? (
                            <button
                                onClick={() => setShowCloseModal(true)}
                                className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                                <X className="w-4 h-4" />
                                Close Ticket
                            </button>
                        ) : (
                            <button
                                onClick={handleReopenTicket}
                                disabled={processingAction}
                                className="px-4 py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                                {processingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                Reopen Ticket
                            </button>
                        )}
                    </div>
                </div>

                {/* Closure Info */}
                {ticket.status === 'closed' && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-red-400 font-medium mb-1">Ticket Closed</h3>
                            <p className="text-red-400/80 text-sm mb-2">
                                Reason: {ticket.closure_reason}
                            </p>
                            {ticket.scheduled_deletion_at && (
                                <p className="text-red-400/60 text-xs">
                                    Scheduled for deletion {formatDistanceToNow(new Date(ticket.scheduled_deletion_at), { addSuffix: true })}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Messages Area */}
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-4 ${msg.is_admin_reply ? 'justify-end' : 'justify-start'}`}
                            >
                                {!msg.is_admin_reply && (
                                    <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center flex-shrink-0">
                                        <User className="w-4 h-4 text-neutral-400" />
                                    </div>
                                )}

                                <div className={`max-w-[80%] space-y-1 ${msg.is_admin_reply ? 'items-end flex flex-col' : ''}`}>
                                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                                        <span className="font-medium text-neutral-300">{msg.sender?.name}</span>
                                        <span>{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</span>
                                    </div>
                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.is_admin_reply
                                        ? 'bg-primary text-white rounded-tr-none'
                                        : 'bg-white/10 text-white rounded-tl-none'
                                        }`}>
                                        {msg.message}
                                    </div>
                                </div>

                                {msg.is_admin_reply && (
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                        <Shield className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Reply Input */}
                    {ticket.status !== 'closed' && (
                        <div className="p-4 border-t border-white/10 bg-black/20">
                            <form onSubmit={handleReply} className="flex gap-3">
                                <input
                                    type="text"
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    placeholder="Type your reply..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !reply.trim()}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Reply
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
