'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteAllNotifications(userId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)

    if (error) {
        throw new Error('Failed to delete notifications')
    }

    revalidatePath('/')
}
