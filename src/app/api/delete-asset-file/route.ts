import { NextRequest, NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand, ListObjectVersionsCommand } from "@aws-sdk/client-s3";
import { createClient } from "@/utils/supabase/server";

const s3 = new S3Client({
    endpoint: process.env.NEXT_PUBLIC_B2_ENDPOINT,
    region: "eu-central-003", // B2 region from the endpoint
    credentials: {
        accessKeyId: process.env.B2_KEY_ID as string,
        secretAccessKey: process.env.B2_APPLICATION_KEY as string,
    },
});

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let body;
        try {
            const rawBody = await req.text();
            body = JSON.parse(rawBody);
        } catch (e) {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { fileKey } = body;

        if (!fileKey) {
            return NextResponse.json({ error: "Missing fileKey" }, { status: 400 });
        }

        // Security check: ensure the user can only delete their own temporary uploads
        // Format is typically assets/{user.id}/...
        if (!fileKey.startsWith(`assets/${user.id}/`)) {
            return NextResponse.json({ error: "Forbidden: Cannot delete files owned by other users" }, { status: 403 });
        }

        // To permanently delete a file in a versioned bucket (like B2 defaults), we must list and delete its specific versions.
        const listCommand = new ListObjectVersionsCommand({
            Bucket: process.env.B2_BUCKET_NAME,
            Prefix: fileKey,
        });

        const listResult = await s3.send(listCommand);

        const deletePromises: Promise<any>[] = [];

        // Delete all data versions of this file
        if (listResult.Versions && listResult.Versions.length > 0) {
            for (const version of listResult.Versions) {
                if (version.Key === fileKey && version.VersionId) {
                    deletePromises.push(
                        s3.send(new DeleteObjectCommand({
                            Bucket: process.env.B2_BUCKET_NAME,
                            Key: fileKey,
                            VersionId: version.VersionId,
                        }))
                    );
                }
            }
        }

        // Also clean up any lingering 'Hide' markers (Delete Markers) 
        if (listResult.DeleteMarkers && listResult.DeleteMarkers.length > 0) {
            for (const marker of listResult.DeleteMarkers) {
                if (marker.Key === fileKey && marker.VersionId) {
                    deletePromises.push(
                        s3.send(new DeleteObjectCommand({
                            Bucket: process.env.B2_BUCKET_NAME,
                            Key: fileKey,
                            VersionId: marker.VersionId,
                        }))
                    );
                }
            }
        }

        if (deletePromises.length > 0) {
            await Promise.all(deletePromises);
        } else {
            // Fallback: if it's not a versioned bucket or we get nothing back, just send a basic delete command
            const fallbackCommand = new DeleteObjectCommand({
                Bucket: process.env.B2_BUCKET_NAME,
                Key: fileKey,
            });
            await s3.send(fallbackCommand);
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error deleting file from B2:", error.name, error.message, error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
