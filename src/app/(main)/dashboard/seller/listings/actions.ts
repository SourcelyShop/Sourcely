'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createListing(formData: FormData) {
    try {
        const supabase = await createClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) redirect('/login')

        const { data: userData } = await supabase
            .from('users')
            .select('stripe_account_id')
            .eq('id', user.id)
            .single()

        if (!userData?.stripe_account_id) {
            throw new Error('You must connect your Stripe account before creating a listing.')
        }

        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const price = parseFloat(formData.get('price') as string)
        const category = formData.get('category') as string
        // For MVP, file_url is a placeholder or text input
        const file_url = formData.get('file_url') as string
        const imageFile = formData.get('image') as File

        let image_url = null

        if (imageFile && imageFile.size > 0) {
            const fileExt = imageFile.name.split('.').pop()
            const fileName = `${user.id}/${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(fileName, imageFile)

            if (uploadError) {
                console.error('Error uploading image:', uploadError)
                throw new Error('Failed to upload image')
            }

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(fileName)

            image_url = publicUrl
        }

        const price_cents = Math.round(price * 100)

        const { error } = await supabase
            .from('asset_listings')
            .insert({
                seller_id: user.id,
                title,
                description,
                price_cents,
                category,
                file_url,
                image_url,
            })

        if (error) {
            console.error('Error creating listing:', error)
            throw new Error(`Failed to create listing: ${error.message}`)
        }

        revalidatePath('/dashboard/seller')
        revalidatePath('/')
    } catch (error) {
        console.error('Unexpected error in createListing:', error)
        throw error
    }

    redirect('/dashboard/seller')
}

export async function updateListing(formData: FormData) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) redirect('/login')

        const listingId = formData.get('id') as string
        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const imageFile = formData.get('image') as File

        const updates: any = {
            title,
            description,
            updated_at: new Date().toISOString(),
        }

        if (imageFile && imageFile.size > 0) {
            const fileExt = imageFile.name.split('.').pop()
            const fileName = `${user.id}/${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(fileName, imageFile)

            if (uploadError) {
                console.error('Error uploading image:', uploadError)
                throw new Error('Failed to upload image')
            }

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(fileName)

            updates.image_url = publicUrl
        }

        const { error } = await supabase
            .from('asset_listings')
            .update(updates)
            .eq('id', listingId)
            .eq('seller_id', user.id) // Ensure ownership

        if (error) {
            console.error('Error updating listing:', error)
            throw new Error(`Failed to update listing: ${error.message}`)
        }

        revalidatePath(`/assets/${listingId}`)
        revalidatePath('/dashboard/seller')
    } catch (error) {
        console.error('Unexpected error in updateListing:', error)
        throw error
    }

    redirect('/dashboard/seller')
}

export async function scheduleDeletion(listingId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Schedule deletion for 3 days from now
    const scheduledAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()

    // 1. Update the listing
    const { data: listing, error } = await supabase
        .from('asset_listings')
        .update({ deletion_scheduled_at: scheduledAt })
        .eq('id', listingId)
        .eq('seller_id', user.id)
        .select('title')
        .single()

    if (error) throw new Error(error.message)

    // 2. Notify all buyers
    const { data: orders } = await supabase
        .from('orders')
        .select('buyer_id')
        .eq('listing_id', listingId)
        .eq('status', 'complete')

    if (orders && orders.length > 0) {
        const notifications = orders
            .filter(order => order.buyer_id !== user.id) // Exclude seller if they bought their own item
            .map(order => ({
                user_id: order.buyer_id,
                type: 'asset_deletion_scheduled',
                data: {
                    asset_id: listingId,
                    asset_title: listing.title,
                    deletion_date: scheduledAt
                },
                read: false
            }))

        const supabaseAdmin = await createAdminClient()
        const { error: notificationError } = await supabaseAdmin
            .from('notifications')
            .insert(notifications)

        if (notificationError) {
            console.error('Error sending deletion notifications:', notificationError)
            // Don't fail the action if notifications fail, but log it
        }
    }

    revalidatePath(`/assets/${listingId}`)
}

export async function cancelDeletion(listingId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('asset_listings')
        .update({ deletion_scheduled_at: null })
        .eq('id', listingId)
        .eq('seller_id', user.id)

    if (error) throw new Error(error.message)

    // Delete the scheduled deletion notifications
    const supabaseAdmin = await createAdminClient()
    const { error: deleteError } = await supabaseAdmin
        .from('notifications')
        .delete()
        .eq('type', 'asset_deletion_scheduled')
        .eq('data->>asset_id', listingId)

    if (deleteError) {
        console.error('Error deleting notifications:', deleteError)
    }

    revalidatePath(`/assets/${listingId}`)
}
