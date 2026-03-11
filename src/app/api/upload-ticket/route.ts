import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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
        // Authenticate the user - only logged-in users can ask for an upload ticket
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { filename, contentType } = body;

        if (!filename || !contentType) {
            return NextResponse.json({ error: "Missing filename or contentType" }, { status: 400 });
        }

        // Generate a unique path in B2: user_id/timestamp-filename
        // This ensures users can't overwrite each other's files
        const key = `assets/${user.id}/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        const command = new PutObjectCommand({
            Bucket: process.env.B2_BUCKET_NAME,
            Key: key,
            ContentType: contentType,
        });

        // The pre-signed URL is valid for 15 minutes
        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

        return NextResponse.json({
            url: signedUrl,
            key: key,
        });

    } catch (error: any) {
        console.error("Error generating presigned upload url:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
