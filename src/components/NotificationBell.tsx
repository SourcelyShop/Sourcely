'use client'

import { useState, useEffect, useRef } from 'react'
import { BellIcon, type BellIconHandle } from './BellIcon'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence } from 'motion/react'
import { formatDistanceToNow } from 'date-fns'
import { deleteAllNotifications } from '@/app/(main)/notifications/actions'
import { ConfirmationModal } from '@/components/ConfirmationModal'


interface Notification {
    id: string
    type: string
    data: any
    read: boolean
    created_at: string
}

export function NotificationBell({ userId }: { userId: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const supabase = createClient()
    const dropdownRef = useRef<HTMLDivElement>(null)
    const bellRef = useRef<BellIconHandle>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    useEffect(() => {
        fetchNotifications()

        // Real-time subscription
        const channel = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const newNotification = payload.new as Notification
                    setNotifications((prev) => [newNotification, ...prev])
                    setUnreadCount((prev) => prev + 1)
                }
            )
            .subscribe()

            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId])

    // Trigger bell animation when there are unread notifications
    useEffect(() => {
        if (unreadCount > 0) {
            // Initial animation
            bellRef.current?.startAnimation()

            // Repeat every 5 seconds
            const interval = setInterval(() => {
                bellRef.current?.startAnimation()
            }, 5000)

            return () => clearInterval(interval)
        } else {
            bellRef.current?.stopAnimation()
        }
    }, [unreadCount])

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const fetchNotifications = async () => {
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .select('*')
            .eq('user_id', userId)
            .gt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false })
            .limit(10)

        if (data) {
            setNotifications(data)
            setUnreadCount(data.filter((n) => !n.read).length)
        }
    }

    const markAsRead = async (id: string) => {
        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id)

        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
    }

    const markAllAsRead = async () => {
        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', userId)
            .eq('read', false)

        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        setUnreadCount(0)
    }

    const markAssetAsRead = async (assetId: string) => {
        // Find all unread notifications for this asset
        const idsToUpdate = notifications
            .filter(n => n.type === 'asset_deletion_scheduled' && n.data.asset_id === assetId && !n.read)
            .map(n => n.id)

        if (idsToUpdate.length === 0) return

        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) =>
                (n.type === 'asset_deletion_scheduled' && n.data.asset_id === assetId)
                    ? { ...n, read: true }
                    : n
            )
        )
        setUnreadCount((prev) => Math.max(0, prev - idsToUpdate.length))

        // DB update
        await supabase
            .from('notifications')
            .update({ read: true })
            .in('id', idsToUpdate)
    }

    const handleDeleteAllClick = () => {
        setIsDeleteModalOpen(true)
        setIsOpen(false) // Close the dropdown
    }

    const confirmDeleteAll = async () => {
        await deleteAllNotifications(userId)
        setNotifications([])
        setUnreadCount(0)
        setIsDeleteModalOpen(false)
    }



    return (
        <>
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-neutral-400 hover:text-white"
                >
                    <BellIcon
                        ref={bellRef}
                        className="w-5 h-5"
                        onMouseEnter={() => bellRef.current?.startAnimation()}
                        onMouseLeave={() => bellRef.current?.stopAnimation()}
                    />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-black">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 top-full mt-2 w-80 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                        >
                            <div className="p-3 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                                    <span className="text-[10px] text-neutral-500">(auto-delete in 7 days)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-xs text-primary hover:text-primary/80 transition-colors text-white/50"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={handleDeleteAllClick}
                                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            Delete All
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-neutral-500 text-sm">
                                        No notifications yet
                                    </div>
                                ) : (
                                    notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${!notification.read ? 'bg-white/[0.02]' : ''}`}
                                            onClick={() => {
                                                markAsRead(notification.id)
                                                if (notification.type === 'asset_deleted') {
                                                    window.location.href = `/assets/${notification.data.asset_id}`
                                                } else if (notification.type === 'admin_new_ticket') {
                                                    window.location.href = `/dashboard/admin/support/${notification.data.ticket_id}`
                                                } else if (notification.type === 'support_reply' || notification.type === 'ticket_closed') {
                                                    window.location.href = `/support`
                                                }
                                            }}
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-1">
                                                    <div className={`w-2 h-2 rounded-full ${!notification.read ? 'bg-primary' : 'bg-transparent'}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm text-white mb-1">
                                                        {notification.type === 'sale' && (
                                                            <>
                                                                You sold an item for <span className="font-bold text-green-400">${(notification.data.amount_cents / 100).toFixed(2)}</span> !
                                                            </>
                                                        )}
                                                        {notification.type === 'premium_welcome' && (
                                                            <>
                                                                Welcome to Premium! <a href="/settings" className="text-purple-400 hover:text-purple-300 underline">Customize your profile</a> now.
                                                            </>
                                                        )}
                                                        {notification.type === 'asset_deleted' && (
                                                            <>
                                                                <span className="text-red-400 font-semibold">Asset Removed:</span> {notification.data.asset_title}.
                                                                <br />
                                                                <span className="text-xs text-neutral-400">
                                                                    Permanently deleted on {new Date(notification.data.deletion_date).toLocaleDateString()}.
                                                                    <span className="text-primary ml-1 hover:underline">Download now</span>
                                                                </span>
                                                            </>
                                                        )}
                                                        {notification.type === 'asset_deletion_scheduled' && (
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-2 text-red-400 font-bold">
                                                                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                                                    IMPORTANT: Deletion Scheduled
                                                                </div>
                                                                <span className="text-white">
                                                                    Asset "<a href={`/assets/${notification.data.asset_id}`} className="underline hover:text-white/80 transition-colors">{notification.data.asset_title}</a>" will be deleted {formatDistanceToNow(new Date(notification.data.deletion_date), { addSuffix: true })}.
                                                                </span>
                                                                <span className="text-xs text-neutral-400">
                                                                    Please download your files immediately.
                                                                </span>
                                                            </div>
                                                        )}
                                                        {notification.type === 'admin_new_ticket' && (
                                                            <>
                                                                <span className="text-primary font-semibold">New Support Ticket:</span> {notification.data.subject}
                                                                <br />
                                                                <span className="text-xs text-neutral-400">
                                                                    From {notification.data.user_name}
                                                                </span>
                                                            </>
                                                        )}
                                                        {notification.type === 'support_reply' && (
                                                            <>
                                                                <span className="text-green-400 font-semibold">New Reply:</span> {notification.data.subject}
                                                                <br />
                                                                <span className="text-xs text-neutral-400">
                                                                    An admin has replied to your ticket.
                                                                </span>
                                                            </>
                                                        )}
                                                        {notification.type === 'ticket_closed' && (
                                                            <>
                                                                <span className="text-red-400 font-semibold">Ticket Closed:</span> {notification.data.subject}
                                                                <br />
                                                                <span className="text-xs text-neutral-400">
                                                                    Reason: {notification.data.reason}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-neutral-500">
                                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteAll}
                title="Delete All Notifications"
                message="Are you sure you want to delete all notifications? This action cannot be undone."
                confirmText="Delete All"
                isDangerous={true}
            />


        </>
    )
}
