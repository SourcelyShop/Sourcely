'use client';

import React, { useEffect, useState } from 'react';
import { getAdminStats, DateRange } from './actions';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { Loader2, Download, MessageSquare } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/animations";

export default function AdminDashboard() {
    const [range, setRange] = useState<DateRange>('7d');
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const data = await getAdminStats(range);
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [range]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black/95 p-8 pt-24">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-10 w-64" />
                        <div className="flex gap-2">
                            <Skeleton className="h-9 w-16" />
                            <Skeleton className="h-9 w-16" />
                            <Skeleton className="h-9 w-16" />
                            <Skeleton className="h-9 w-16" />
                        </div>
                    </div>

                    {/* Stats Cards Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-32 rounded-xl" />
                        ))}
                    </div>

                    {/* Charts Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Skeleton className="h-[400px] rounded-xl" />
                        <Skeleton className="h-[400px] rounded-xl" />
                    </div>

                    {/* Bottom Section Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Skeleton className="h-[400px] rounded-xl lg:col-span-2" />
                        <Skeleton className="h-[400px] rounded-xl lg:col-span-2" />
                    </div>
                </div>
            </div>
        );
    }

    if (!stats) return <div>Error loading stats</div>;

    const pieData = [
        { name: 'Monthly', value: stats.subscriptionSplit.month },
        { name: 'Yearly', value: stats.subscriptionSplit.year },
    ];
    const COLORS = ['#0088FE', '#00C49F'];

    const downloadCSV = (data: any[], filename: string) => {
        if (!data || data.length === 0) return;

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="min-h-screen bg-black/95 p-8 pt-24">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-white">Admin Dashboard (only real sigmas can see this)</h1>
                        <Link href="/dashboard/admin/support" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 relative group">
                            <MessageSquare className="w-4 h-4" />
                            Support Tickets
                            {stats.openTicketCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    {stats.openTicketCount}
                                </span>
                            )}
                        </Link>
                    </div>
                    <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
                        {(['24h', '7d', '30d', 'all'] as DateRange[]).map((r) => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${range === r ? 'bg-primary text-white' : 'text-neutral-400 hover:text-white'}`}
                            >
                                {r.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats Cards */}
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StaggerItem><Card title="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} sub="All sources" /></StaggerItem>
                    <StaggerItem><Card title="Marketplace Rev" value={`$${stats.totalMarketplaceRevenue.toFixed(2)}`} sub="Commissions" /></StaggerItem>
                    <StaggerItem><Card title="Subscription Rev" value={`$${stats.totalSubscriptionRevenue.toFixed(2)}`} sub="Premium plans" /></StaggerItem>
                    <StaggerItem><Card title="New Users" value={stats.totalNewUsers} sub="Signups in range" /></StaggerItem>
                </StaggerContainer>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <FadeIn delay={0.2} className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-white">Revenue Sources</h3>
                            <button
                                onClick={() => downloadCSV(stats.graphData.map((d: any) => ({
                                    Date: d.date,
                                    'Marketplace Revenue': d.revenue,
                                    'Subscription Revenue': d.subRevenue
                                })), 'revenue_sources.csv')}
                                className="flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Export CSV
                            </button>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.graphData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorSubRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="date" stroke="#666" />
                                    <YAxis stroke="#666" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" name="Marketplace ($)" />
                                    <Area type="monotone" dataKey="subRevenue" stackId="1" stroke="#82ca9d" fillOpacity={1} fill="url(#colorSubRevenue)" name="Subscriptions ($)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </FadeIn>

                    <FadeIn delay={0.3} className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-white">New Users</h3>
                            <button
                                onClick={() => downloadCSV(stats.graphData.map((d: any) => ({
                                    Date: d.date,
                                    'New Users': d.users
                                })), 'new_users.csv')}
                                className="flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Export CSV
                            </button>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.graphData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="date" stroke="#666" />
                                    <YAxis stroke="#666" />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="users" fill="#3b82f6" name="New Users" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </FadeIn>

                    {/* Subscription Split */}
                    <FadeIn delay={0.4} className="bg-white/5 border border-white/10 rounded-xl p-6 lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-white">Premium Subscriptions</h3>
                            <button
                                onClick={() => downloadCSV(pieData.map((d: any) => ({
                                    Type: d.name,
                                    Count: d.value
                                })), 'subscription_split.csv')}
                                className="flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Export CSV
                            </button>
                        </div>
                        <div className="h-[300px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </FadeIn>

                    {/* User Index Table */}
                    <FadeIn delay={0.5} className="bg-white/5 border border-white/10 rounded-xl p-6 lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-white">User Index <span className="text-neutral-400 text-base font-normal ml-2">(Total Accounts: {stats.users.length})</span></h3>
                            <button
                                onClick={() => downloadCSV(stats.users.map((u: any, i: number) => ({
                                    Index: i + 1,
                                    Name: u.name || 'Unknown',
                                    Email: u.email,
                                    Joined: new Date(u.created_at).toLocaleDateString()
                                })), 'user_index.csv')}
                                className="flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Export CSV
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-neutral-400">
                                <thead className="bg-white/5 text-neutral-200 uppercase font-medium">
                                    <tr>
                                        <th className="px-6 py-3 rounded-tl-lg">#</th>
                                        <th className="px-6 py-3">User</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3 rounded-tr-lg">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {stats.users.map((user: any, index: number) => (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-mono text-primary">#{index + 1}</td>
                                            <td className="px-6 py-4 font-medium text-white">{user.name || 'Unknown'}</td>
                                            <td className="px-6 py-4">{user.email}</td>
                                            <td className="px-6 py-4">{new Date(user.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </FadeIn>

                </div>
            </div>
        </div>
    );
}

function Card({ title, value, sub }: { title: string, value: string | number, sub: string }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">{title}</h3>
            <div className="mt-2 text-3xl font-bold text-white">{value}</div>
            <p className="mt-1 text-sm text-neutral-500">{sub}</p>
        </div>
    );
}
