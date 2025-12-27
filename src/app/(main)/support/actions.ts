'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createTicket(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const supabaseAdmin = await createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'You must be logged in to submit a ticket.' }
    }

    const subject = formData.get('subject') as string
    const message = formData.get('message') as string

    if (!subject || !message) {
        return { error: 'Subject and message are required.' }
    }

    try {
        // 1. Create Ticket
        const { data: ticket, error: ticketError } = await supabase
            .from('support_tickets')
            .insert({
                user_id: user.id,
                subject,
                status: 'open'
            })
            .select()
            .single()

        if (ticketError) throw ticketError

        // 2. Create First Message
        const { error: messageError } = await supabase
            .from('support_messages')
            .insert({
                ticket_id: ticket.id,
                sender_id: user.id,
                message,
                is_admin_reply: false
            })

        if (messageError) throw messageError

        // 3. Notify Admins
        // Fetch all admin users
        const { data: admins } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('is_admin', true)

        if (admins && admins.length > 0) {
            const notifications = admins.map(admin => ({
                user_id: admin.id,
                type: 'admin_new_ticket',
                data: {
                    ticket_id: ticket.id,
                    subject: ticket.subject,
                    user_name: user.user_metadata.name || user.email
                },
                read: false
            }))

            await supabaseAdmin
                .from('notifications')
                .insert(notifications)
        }

        return { success: true }
    } catch (error) {
        console.error('Failed to create ticket:', error)
        return { error: 'Failed to submit ticket. Please try again.' }
    }
}

export async function replyToTicket(ticketId: string, message: string) {
    const supabase = await createClient()
    const supabaseAdmin = await createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // 1. Check if user is admin
    const { data: userData } = await supabaseAdmin
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()

    const isAdmin = userData?.is_admin || false

    // 2. Get Ticket to check ownership
    const { data: ticket } = await supabaseAdmin
        .from('support_tickets')
        .select('user_id, subject')
        .eq('id', ticketId)
        .single()

    if (!ticket) return { error: 'Ticket not found' }

    // 3. Verify permissions (Admin OR Ticket Owner)
    if (!isAdmin && ticket.user_id !== user.id) {
        return { error: 'Unauthorized' }
    }

    const isAdminReply = isAdmin

    try {
        // 4. Create Reply
        await supabaseAdmin
            .from('support_messages')
            .insert({
                ticket_id: ticketId,
                sender_id: user.id,
                message,
                is_admin_reply: isAdminReply
            })

        // 5. Update Ticket Status if Admin Reply
        if (isAdminReply) {
            await supabaseAdmin
                .from('support_tickets')
                .update({ status: 'in_progress' })
                .eq('id', ticketId)
        }

        // 6. Send Notifications
        if (isAdminReply) {
            // Notify User
            await supabaseAdmin
                .from('notifications')
                .insert({
                    user_id: ticket.user_id,
                    type: 'support_reply',
                    data: {
                        ticket_id: ticketId,
                        subject: ticket.subject
                    },
                    read: false
                })
        } else {
            // Notify Admins
            const { data: admins } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('is_admin', true)

            if (admins && admins.length > 0) {
                const notifications = admins.map(admin => ({
                    user_id: admin.id,
                    type: 'admin_new_ticket', // Reusing this type or we could create 'admin_new_reply'
                    data: {
                        ticket_id: ticketId,
                        subject: ticket.subject,
                        user_name: user.user_metadata.name || user.email,
                        is_reply: true
                    },
                    read: false
                }))

                await supabaseAdmin
                    .from('notifications')
                    .insert(notifications)
            }
        }

        revalidatePath(`/dashboard/admin/support/${ticketId}`)
        revalidatePath('/support') // Revalidate user support page
        return { success: true }
    } catch (error) {
        console.error('Failed to reply:', error)
        return { error: 'Failed to send reply' }
    }
}


export async function closeTicket(ticketId: string, reason: string) {
    const supabase = await createClient()
    const supabaseAdmin = await createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Verify admin
    const { data: userData } = await supabaseAdmin
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()

    if (!userData?.is_admin) return { error: 'Unauthorized' }

    // Fetch ticket to get user_id
    const { data: ticket } = await supabaseAdmin
        .from('support_tickets')
        .select('user_id, subject')
        .eq('id', ticketId)
        .single()

    if (!ticket) return { error: 'Ticket not found' }

    try {
        const scheduledDeletion = new Date()
        scheduledDeletion.setDate(scheduledDeletion.getDate() + 3)

        const { error } = await supabaseAdmin
            .from('support_tickets')
            .update({
                status: 'closed',
                closure_reason: reason,
                closed_at: new Date().toISOString(),
                scheduled_deletion_at: scheduledDeletion.toISOString()
            })
            .eq('id', ticketId)

        if (error) throw error

        // Send Notification
        await supabaseAdmin
            .from('notifications')
            .insert({
                user_id: ticket.user_id,
                type: 'ticket_closed',
                data: {
                    ticket_id: ticketId,
                    subject: ticket.subject,
                    reason: reason
                },
                read: false
            })

        revalidatePath(`/dashboard/admin/support/${ticketId}`)
        return { success: true }
    } catch (error) {
        console.error('Failed to close ticket:', error)
        return { error: 'Failed to close ticket' }
    }
}

export async function reopenTicket(ticketId: string) {
    const supabase = await createClient()
    const supabaseAdmin = await createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Verify admin
    const { data: userData } = await supabaseAdmin
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()

    if (!userData?.is_admin) return { error: 'Unauthorized' }

    try {
        const { error } = await supabaseAdmin
            .from('support_tickets')
            .update({
                status: 'open',
                closure_reason: null,
                closed_at: null,
                scheduled_deletion_at: null
            })
            .eq('id', ticketId)

        if (error) throw error

        revalidatePath(`/dashboard/admin/support/${ticketId}`)
        return { success: true }
    } catch (error) {
        console.error('Failed to reopen ticket:', error)
        return { error: 'Failed to reopen ticket' }
    }
}
