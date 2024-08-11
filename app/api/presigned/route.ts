import { NextResponse, type NextRequest } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { validateRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { session } = await validateRequest();

    if (!session) {
      return NextResponse.json("Not Authorized", { status: 401 });
    }

    const accessKeyId = process.env.ACCESS_KEY_ID;
    const secretAccessKey = process.env.SECRET_KEY;
    const s3BucketName = process.env.S3_BUCKET_NAME;

    console.log("before keys");

    if (!accessKeyId || !secretAccessKey || !s3BucketName) {
      return new Response(null, { status: 500 });
    }

    const searchParams = request.nextUrl.searchParams;
    const fileName = searchParams.get("fileName");
    const contentType = searchParams.get("contentType");
   
    if (!fileName || !contentType) {
      return new Response(null, { status: 500 });
    }
    console.log("here");
    const client = new S3Client({
      region: "ap-south-1",
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    const command = new PutObjectCommand({
      Bucket: s3BucketName,
      Key: fileName,
      ContentType: contentType,
    });
    const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
    if (signedUrl) return NextResponse.json({ signedUrl });
    return new Response(null, { status: 500 });
  } catch (error) {
    console.error(error, "[ERROR]");
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
