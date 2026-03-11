import { createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { S3Client, DeleteObjectCommand, ListObjectVersionsCommand } from "@aws-sdk/client-s3"

export async function GET(request: Request) {
    try {
        const supabase = await createAdminClient()
        const { searchParams } = new URL(request.url)
        const forceId = searchParams.get('forceId')

        const s3 = new S3Client({
            endpoint: process.env.NEXT_PUBLIC_B2_ENDPOINT,
            region: "eu-central-003",
            credentials: {
                accessKeyId: process.env.B2_KEY_ID as string,
                secretAccessKey: process.env.B2_APPLICATION_KEY as string,
            },
        });

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

            // 1b. Delete the main asset file from Backblaze B2
            if (asset.file_url) {
                try {
                    // Try to extract the B2 key from the file_url or use the raw key if it is stored directly
                    let fileKey = asset.file_url;

                    if (fileKey) {
                        debugLogs.push(`Attempting to delete B2 file: ${fileKey}`);
                        const listCommand = new ListObjectVersionsCommand({
                            Bucket: process.env.B2_BUCKET_NAME,
                            Prefix: fileKey,
                        });
                        const listResult = await s3.send(listCommand);

                        const deletePromises: Promise<any>[] = [];

                        if (listResult.Versions && listResult.Versions.length > 0) {
                            for (const version of listResult.Versions) {
                                if (version.Key === fileKey && version.VersionId) {
                                    deletePromises.push(s3.send(new DeleteObjectCommand({
                                        Bucket: process.env.B2_BUCKET_NAME,
                                        Key: fileKey,
                                        VersionId: version.VersionId,
                                    })));
                                }
                            }
                        }

                        if (listResult.DeleteMarkers && listResult.DeleteMarkers.length > 0) {
                            for (const marker of listResult.DeleteMarkers) {
                                if (marker.Key === fileKey && marker.VersionId) {
                                    deletePromises.push(s3.send(new DeleteObjectCommand({
                                        Bucket: process.env.B2_BUCKET_NAME,
                                        Key: fileKey,
                                        VersionId: marker.VersionId,
                                    })));
                                }
                            }
                        }

                        if (deletePromises.length > 0) {
                            await Promise.all(deletePromises);
                            debugLogs.push(`Deleted ${deletePromises.length} versions/markers of B2 file: ${fileKey}`);
                        } else {
                            const fallbackCommand = new DeleteObjectCommand({
                                Bucket: process.env.B2_BUCKET_NAME,
                                Key: fileKey,
                            });
                            await s3.send(fallbackCommand);
                            debugLogs.push(`Deleted fallback B2 file: ${fileKey}`);
                        }
                    }
                } catch (e: any) {
                    console.error("Failed to delete B2 file during cron:", e);
                    debugLogs.push(`Failed to delete B2 file ${asset.file_url}: ${e.message}`);
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
