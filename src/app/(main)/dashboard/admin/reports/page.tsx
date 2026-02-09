'use client'

import { useState, useEffect } from 'react'
import { getAdminTickets } from '@/app/(main)/dashboard/admin/actions'
import Link from 'next/link'
import { Flag, ArrowLeft, ExternalLink, MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function AdminReportsPage() {
    const [reports, setReports] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReports = async () => {
            const allTickets = await getAdminTickets({ status: 'all' })
            // Filter for tickets that start with [REPORT]
            const reportTickets = allTickets.filter((t: any) => t.subject.startsWith('[REPORT]'))
            setReports(reportTickets)
            setLoading(false)
        }
        fetchReports()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-black/95 p-8 pt-24 text-white">
                Loading reports...
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black/95 p-8 pt-24">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/admin" className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Flag className="w-8 h-8 text-red-500" />
                            Reports & DMCA
                        </h1>
                        <p className="text-neutral-400">Manage reported content and users</p>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-neutral-400">
                            <thead className="bg-white/5 text-neutral-200 uppercase font-medium">
                                <tr>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Subject</th>
                                    <th className="px-6 py-4">Reporter</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {reports.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                                            No reports found. Good job!
                                        </td>
                                    </tr>
                                ) : (
                                    reports.map((report) => (
                                        <tr key={report.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${report.status === 'open' ? 'bg-red-500/20 text-red-400' :
                                                        report.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                                                            'bg-green-500/20 text-green-400'
                                                    }`}>
                                                    {report.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-white">
                                                {report.subject.replace('[REPORT] ', '')}
                                            </td>
                                            <td className="px-6 py-4">
                                                {report.user?.name || report.user?.email || 'Unknown'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/dashboard/admin/support/${report.id}`}
                                                    className="text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                                                >
                                                    View Details <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
