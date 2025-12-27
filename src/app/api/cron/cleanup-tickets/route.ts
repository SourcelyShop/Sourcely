import { createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const supabase = await createAdminClient()

        // Find tickets scheduled for deletion in the past
        const { data: ticketsToDelete, error: fetchError } = await supabase
            .from('support_tickets')
            .select('id')
            .not('scheduled_deletion_at', 'is', null)
            .lt('scheduled_deletion_at', new Date().toISOString())

        if (fetchError) {
            throw new Error(`Failed to fetch tickets to delete: ${fetchError.message}`)
        }

        if (!ticketsToDelete || ticketsToDelete.length === 0) {
            return NextResponse.json({ message: 'No tickets to delete' })
        }

        const deletedIds = []
        const errors = []
        const debugLogs: string[] = []

        for (const ticket of ticketsToDelete) {
            debugLogs.push(`Processing ticket ${ticket.id}`)

            // 1. Delete messages (if not cascaded, but good to be explicit/safe)
            const { error: deleteMessagesError } = await supabase
                .from('support_messages')
                .delete()
                .eq('ticket_id', ticket.id)

            if (deleteMessagesError) {
                const msg = `Failed to delete messages for ticket ${ticket.id}: ${deleteMessagesError.message}`
                console.error(msg)
                debugLogs.push(msg)
                // We continue anyway to try and delete the ticket, or should we stop? 
                // If cascade is on, deleting ticket will delete messages. 
                // If we fail here, deleting ticket might fail if no cascade.
                // Let's log and try deleting ticket.
            }

            // 2. Delete the ticket
            const { error: deleteError } = await supabase
                .from('support_tickets')
                .delete()
                .eq('id', ticket.id)

            if (deleteError) {
                const msg = `Failed to delete ticket ${ticket.id}: ${deleteError.message}`
                debugLogs.push(msg)
                errors.push({ id: ticket.id, error: deleteError.message })
            } else {
                debugLogs.push(`Successfully deleted ticket ${ticket.id}`)
                deletedIds.push(ticket.id)
            }
        }

        return NextResponse.json({
            message: `Deleted ${deletedIds.length} tickets`,
            deletedIds,
            errors,
            debugLogs
        })

    } catch (error: any) {
        console.error('Error in cleanup-tickets cron:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
