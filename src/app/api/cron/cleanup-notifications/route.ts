import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    // Verify authorization (e.g., check for a secret header if using Vercel Cron)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Allow running without auth in development or if no secret is set (for testing)
        if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
    }

    const supabaseAdmin = await createAdminClient()
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { error, count } = await supabaseAdmin
        .from('notifications')
        .delete({ count: 'exact' })
        .lt('created_at', sevenDaysAgo)

    if (error) {
        console.error('Error deleting old notifications:', error)
        return NextResponse.json({ error: 'Failed to delete notifications' }, { status: 500 })
    }

    return NextResponse.json({ success: true, deleted: count })
}
