'use client'

import { useState, useEffect } from 'react'
import { getAdminTickets } from '@/app/(main)/dashboard/admin/actions'
import Link from 'next/link'
import { Loader2, MessageSquare, ArrowLeft } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Ticket {
    id: string
    subject: string
    status: 'open' | 'closed' | 'in_progress'
    created_at: string
    user: {
        name: string
        email: string
    }
}

import { Dropdown } from '@/components/ui/dropdown'
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminSupportPage() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({
        status: 'all',
        subject: 'all'
    })

    useEffect(() => {
        fetchTickets()
    }, [filters])

    const fetchTickets = async () => {
        setLoading(true)
        const data = await getAdminTickets(filters)
        if (data) {
            setTickets(data)
        }
        setLoading(false)
    }

    if (loading && tickets.length === 0) {
        return (
            <div className="min-h-screen bg-black/95 p-8 pt-24">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-10 w-48" />
                        </div>
                        <div className="flex gap-4">
                            <Skeleton className="h-10 w-40" />
                            <Skeleton className="h-10 w-40" />
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-white/5 bg-white/5">
                            <div className="flex justify-between">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-6 w-24" />
                                ))}
                            </div>
                        </div>
                        <div className="divide-y divide-white/5">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="p-4 flex justify-between items-center">
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                    <Skeleton className="h-6 w-48" />
                                    <div className="flex flex-col gap-1">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-8 w-16" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black/95 p-8 pt-24">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/admin" className="p-2 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-3xl font-bold text-white">Support Tickets</h1>
                    </div>

                    <div className="flex gap-4">
                        <Dropdown
                            label="Status"
                            value={filters.status}
                            onChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
                            options={[
                                { label: 'All Status', value: 'all' },
                                { label: 'Open', value: 'open' },
                                { label: 'In Progress', value: 'in_progress' },
                                { label: 'Closed', value: 'closed' }
                            ]}
                            className="min-w-[160px]"
                        />

                        <Dropdown
                            label="Subject"
                            value={filters.subject}
                            onChange={(val) => setFilters(prev => ({ ...prev, subject: val }))}
                            options={[
                                { label: 'All Subjects', value: 'all' },
                                { label: 'Bug Report', value: 'Bug Report' },
                                { label: 'Feature Request', value: 'Feature Request' },
                                { label: 'Account Issue', value: 'Account Issue' },
                                { label: 'Billing', value: 'Billing' },
                                { label: 'Partnership', value: 'Partnership' },
                                { label: 'Other', value: 'Other' }
                            ]}
                            className="min-w-[160px]"
                        />
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-neutral-400">
                            <thead className="bg-white/5 text-neutral-200 uppercase font-medium">
                                <tr>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Subject</th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Created</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {tickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${ticket.status === 'open' ? 'bg-green-500/20 text-green-400' :
                                                ticket.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                                }`}>
                                                {ticket.status.toUpperCase().replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-white">
                                            {ticket.subject}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-white">{ticket.user?.name || 'Unknown'}</span>
                                                <span className="text-xs">{ticket.user?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/dashboard/admin/support/${ticket.id}`}
                                                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {tickets.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                                            No tickets found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
