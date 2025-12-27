'use client'

import React, { useState, useEffect } from 'react'
import { SupportForm } from '@/components/SupportForm'
import { createClient } from '@/utils/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, ChevronDown, ChevronUp, User, Shield } from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/animations";

interface Ticket {
    id: string
    subject: string
    status: 'open' | 'closed' | 'in_progress'
    created_at: string
    closure_reason?: string
    messages?: Message[]
}

interface Message {
    id: string
    message: string
    created_at: string
    is_admin_reply: boolean
    sender_id: string
}

import { replyToTicket } from '@/app/(main)/support/actions'
import { Loader2, Send } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"

// ... (previous imports)

export default function SupportPage() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [expandedTicket, setExpandedTicket] = useState<string | null>(null)
    const [replyMessage, setReplyMessage] = useState('')
    const [isSubmittingReply, setIsSubmittingReply] = useState(false)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        fetchTickets()
    }, [])

    // ... (subscription effect)

    const fetchTickets = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('support_tickets')
            .select(`
                *,
                messages:support_messages(*)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (data) {
            // Sort messages within tickets
            const ticketsWithSortedMessages = data.map(ticket => ({
                ...ticket,
                messages: ticket.messages?.sort((a: any, b: any) =>
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                )
            }))
            setTickets(ticketsWithSortedMessages)
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="relative min-h-screen w-full overflow-hidden">
                <div className="min-h-screen flex flex-col items-center justify-start pt-32 px-4 pb-20">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white/90 to-white/40 tracking-tight drop-shadow-2xl text-center">
                        Support
                    </h1>
                    <p className="text-neutral-400 text-center mb-12 max-w-lg">
                        If you have any questions or need assistance, please don't hesitate to contact us.
                    </p>

                    <SupportForm />

                    <div className="w-full max-w-2xl mt-16">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <MessageSquare className="w-6 h-6" />
                            My Tickets
                        </h2>
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <Skeleton className="h-5 w-16 rounded-full" />
                                            <Skeleton className="h-5 w-48" />
                                        </div>
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                    <Skeleton className="h-5 w-5 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const toggleTicket = (id: string) => {
        setExpandedTicket(expandedTicket === id ? null : id)
        setReplyMessage('') // Clear reply when toggling
    }

    const handleReplySubmit = async (e: React.FormEvent, ticketId: string) => {
        e.preventDefault()
        if (!replyMessage.trim()) return

        setIsSubmittingReply(true)
        const result = await replyToTicket(ticketId, replyMessage)

        if (result?.success) {
            setReplyMessage('')
            await fetchTickets() // Refresh messages
        } else {
            alert('Failed to send reply')
        }
        setIsSubmittingReply(false)
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <div className="min-h-screen flex flex-col items-center justify-start pt-32 px-4 pb-20">
                {/* ... (Header and SupportForm) */}
                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white/90 to-white/40 tracking-tight drop-shadow-2xl text-center">
                    Support
                </h1>
                <p className="text-neutral-400 text-center mb-12 max-w-lg">
                    If you have any questions or need assistance, please don't hesitate to contact us.
                </p>

                <SupportForm />

                {/* My Tickets Section */}
                {tickets.length > 0 && (
                    <div className="w-full max-w-2xl mt-16">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                            <MessageSquare className="w-6 h-6" />
                            My Tickets
                        </h2>
                        <StaggerContainer className="space-y-4">
                            {tickets.map((ticket) => (
                                <StaggerItem key={ticket.id}>
                                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => toggleTicket(ticket.id)}
                                            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
                                        >
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${ticket.status === 'open' ? 'bg-green-500/20 text-green-400' :
                                                        ticket.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-neutral-500/20 text-neutral-400'
                                                        }`}>
                                                        {ticket.status.toUpperCase().replace('_', ' ')}
                                                    </span>
                                                    <h3 className="font-semibold text-white">{ticket.subject}</h3>
                                                </div>
                                                <p className="text-xs text-neutral-500">
                                                    Created {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                                                </p>
                                            </div>
                                            {expandedTicket === ticket.id ? (
                                                <ChevronUp className="w-5 h-5 text-neutral-400" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-neutral-400" />
                                            )}
                                        </button>

                                        {expandedTicket === ticket.id && (
                                            <div className="border-t border-white/10 bg-black/20 p-4 space-y-4">
                                                {ticket.messages?.map((msg) => (
                                                    <div key={msg.id} className={`flex gap-3 ${msg.is_admin_reply ? 'justify-start' : 'justify-end'}`}>
                                                        {msg.is_admin_reply && (
                                                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                                                <Shield className="w-4 h-4 text-white" />
                                                            </div>
                                                        )}

                                                        <div className={`max-w-[80%] space-y-1 ${msg.is_admin_reply ? '' : 'items-end flex flex-col'}`}>
                                                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                                                                <span className="font-medium text-neutral-300">
                                                                    {msg.is_admin_reply ? 'Support Team' : 'You'}
                                                                </span>
                                                                <span>{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</span>
                                                            </div>
                                                            <div className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.is_admin_reply
                                                                ? 'bg-primary/10 text-white rounded-tl-none border border-primary/20'
                                                                : 'bg-white/10 text-white rounded-tr-none'
                                                                }`}>
                                                                {msg.message}
                                                            </div>
                                                        </div>

                                                        {!msg.is_admin_reply && (
                                                            <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center flex-shrink-0">
                                                                <User className="w-4 h-4 text-neutral-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}

                                                {/* Closure Reason */}
                                                {ticket.status === 'closed' && ticket.closure_reason && (
                                                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                                                        <h4 className="text-red-400 font-bold mb-1 text-sm">Ticket Closed</h4>
                                                        <p className="text-neutral-300 text-sm">{ticket.closure_reason}</p>
                                                    </div>
                                                )}

                                                {/* Reply Form */}
                                                {ticket.status !== 'closed' && (
                                                    <form onSubmit={(e) => handleReplySubmit(e, ticket.id)} className="mt-4 pt-4 border-t border-white/10 flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={replyMessage}
                                                            onChange={(e) => setReplyMessage(e.target.value)}
                                                            placeholder="Type your reply..."
                                                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                        />
                                                        <button
                                                            type="submit"
                                                            disabled={isSubmittingReply || !replyMessage.trim()}
                                                            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-bold"
                                                        >
                                                            {isSubmittingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                                            Reply
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </StaggerItem>
                            ))}
                        </StaggerContainer>
                    </div>
                )}
            </div>
        </div>
    )
}
