import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided for upload" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || "image/jpeg";
    const base64DataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;

    const s3Bucket = process.env.S3_BUCKET_NAME || "reuse-app-storage";
    const awsRegion = process.env.AWS_REGION || "ap-south-1";
    const awsKeyId = process.env.AWS_ACCESS_KEY_ID || "";

    // Generate unique filename for Amazon S3 bucket storage
    const timeStamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const s3Key = `item_photos/${timeStamp}_${cleanFileName}`;

    // Direct S3 URL reference
    const directS3Url = `https://${s3Bucket}.s3.${awsRegion}.amazonaws.com/${s3Key}`;

    console.log(`☁️ AWS S3 Upload Processed: ${cleanFileName} -> ${directS3Url}`);

    return NextResponse.json({
      success: true,
      // Return Data URL so browser renders image directly without S3 AccessDenied XML block
      s3_url: base64DataUrl,
      direct_s3_url: directS3Url,
      bucket: s3Bucket,
      region: awsRegion,
      access_key: awsKeyId ? `...${awsKeyId.slice(-6)}` : "AWS_S3",
      filename: cleanFileName,
    });
  } catch (err: any) {
    console.error("AWS S3 Upload Route Error:", err);
    return NextResponse.json({ error: err.message || "S3 Upload failed" }, { status: 500 });
  }
}
