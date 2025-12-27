import { createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const supabase = await createAdminClient()
        const { searchParams } = new URL(request.url)
        const forceId = searchParams.get('forceId')

        let assetsToDelete = []
        let fetchError = null

        if (forceId) {
            const { data, error } = await supabase
                .from('asset_listings')
                .select('id, image_url, file_url, seller_id')
                .eq('id', forceId)

            assetsToDelete = data || []
            fetchError = error
        } else {
            // Find assets scheduled for deletion in the past
            const { data, error } = await supabase
                .from('asset_listings')
                .select('id, image_url, file_url, seller_id')
                .not('deletion_scheduled_at', 'is', null)
                .lt('deletion_scheduled_at', new Date().toISOString())

            assetsToDelete = data || []
            fetchError = error
        }

        if (fetchError) {
            throw new Error(`Failed to fetch assets to delete: ${fetchError.message}`)
        }

        if (!assetsToDelete || assetsToDelete.length === 0) {
            return NextResponse.json({ message: 'No assets to delete' })
        }

        const deletedIds = []
        const errors = []
        const debugLogs: string[] = []

        for (const asset of assetsToDelete) {
            debugLogs.push(`Processing asset ${asset.id}`)

            // 1. Delete files from storage
            if (asset.image_url) {
                const imagePath = asset.image_url.split('/').pop() // Extract filename
                if (imagePath) {
                    try {
                        const url = new URL(asset.image_url)
                        const pathParts = url.pathname.split('/')
                        const bucketIndex = pathParts.indexOf('product-images')
                        if (bucketIndex !== -1 && bucketIndex + 1 < pathParts.length) {
                            const filePath = pathParts.slice(bucketIndex + 1).join('/')
                            await supabase.storage.from('product-images').remove([filePath])
                        }
                    } catch (e) {
                        console.error('Error parsing image URL:', e)
                    }
                }
            }

            // 2. Delete related orders
            // Fetch orders first to ensure we have the IDs
            const { data: ordersToDelete, error: fetchOrdersError } = await supabase
                .from('orders')
                .select('id, listing_id')
                .eq('listing_id', asset.id)

            if (fetchOrdersError) {
                const msg = `Error fetching orders for asset ${asset.id}: ${fetchOrdersError.message}`
                console.error(msg)
                debugLogs.push(msg)
            } else {
                const msg = `Found ${ordersToDelete?.length || 0} orders for asset ${asset.id}`
                console.log(msg)
                debugLogs.push(msg)
            }

            if (ordersToDelete && ordersToDelete.length > 0) {
                const orderIds = ordersToDelete.map(o => o.id)
                debugLogs.push(`Attempting to delete orders: ${orderIds.join(', ')}`)

                const { error: deleteOrdersError, count: deletedOrderCount } = await supabase
                    .from('orders')
                    .delete({ count: 'exact' })
                    .in('id', orderIds)

                if (deleteOrdersError) {
                    const msg = `Failed to delete orders ${orderIds.join(', ')}: ${deleteOrdersError.message}`
                    console.error(msg)
                    debugLogs.push(msg)
                    errors.push({ id: asset.id, error: msg })
                    continue // Skip deleting the asset if we couldn't delete orders
                }

                if (deletedOrderCount !== null) {
                    const msg = `Successfully deleted ${deletedOrderCount} orders for asset ${asset.id}`
                    console.log(msg)
                    debugLogs.push(msg)
                }
            } else {
                debugLogs.push(`No orders found to delete for asset ${asset.id}`)
            }

            // 3. Delete the record
            const { error: deleteError } = await supabase
                .from('asset_listings')
                .delete()
                .eq('id', asset.id)

            if (deleteError) {
                const msg = `Failed to delete asset ${asset.id}: ${deleteError.message}`
                debugLogs.push(msg)
                errors.push({ id: asset.id, error: deleteError.message })
            } else {
                debugLogs.push(`Successfully deleted asset ${asset.id}`)
                deletedIds.push(asset.id)
            }
        }

        return NextResponse.json({
            message: `Deleted ${deletedIds.length} assets`,
            deletedIds,
            errors,
            debugLogs
        })

    } catch (error: any) {
        console.error('Error in cleanup-assets cron:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
