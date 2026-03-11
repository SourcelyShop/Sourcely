import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createClient } from "@/utils/supabase/server";

const s3 = new S3Client({
    endpoint: process.env.NEXT_PUBLIC_B2_ENDPOINT,
    region: "eu-central-003",
    credentials: {
        accessKeyId: process.env.B2_KEY_ID as string,
        secretAccessKey: process.env.B2_APPLICATION_KEY as string,
    },
});

export async function GET(req: NextRequest) {
    try {
        const assetId = req.nextUrl.searchParams.get('assetId');

        if (!assetId) {
            return NextResponse.json({ error: "Missing assetId" }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
        }

        // 1. Fetch the asset details to get the file path and verify existence
        const { data: asset, error: assetError } = await supabase
            .from('asset_listings')
            .select('file_url, seller_id, file_size_bytes')
            .eq('id', assetId)
            .single();

        if (assetError || !asset || !asset.file_url) {
            return NextResponse.json({ error: "Asset not found or no file attached." }, { status: 404 });
        }

        // 2. Authorization Check
        // If the user isn't the seller, verify they bought it or it's free
        let canDownload = false;

        if (asset.seller_id === user.id) {
            canDownload = true; // Sellers can always download their own stuff
        } else {
            // Check if it was free and they claimed it in an order, or if they paid
            const { data: order } = await supabase
                .from('orders')
                .select('id')
                .eq('listing_id', assetId)
                .eq('buyer_id', user.id)
                .eq('status', 'complete')
                .single();

            if (order) {
                canDownload = true;
            }
        }

        if (!canDownload) {
            return NextResponse.json({ error: "Access Denied. You must purchase this asset to download it." }, { status: 403 });
        }

        // 3. Generate the temporary download ticket
        // By default, let's assume `asset.file_url` stores the B2 `Key` (e.g. assets/uuid/time-file.zip)
        const command = new GetObjectCommand({
            Bucket: process.env.B2_BUCKET_NAME,
            Key: asset.file_url,
            // To force a download instead of attempting to play in browser
            ResponseContentDisposition: `attachment; filename="${asset.file_url.split('/').pop()}"`
        });

        // The ticket is only valid for 5 minutes (prevent link sharing)
        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

        return NextResponse.redirect(signedUrl);

    } catch (error: any) {
        console.error("Error generating presigned download url:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
