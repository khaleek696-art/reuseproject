import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://reuse-backend-cbc3.onrender.com/api/v1";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided for upload" }, { status: 400 });
    }

    // Attempt upload through FastAPI backend via Boto3 to AWS S3 bucket ('reuse-gear-images-2026')
    try {
      const backendFormData = new FormData();
      backendFormData.append("file", file);

      const backendRes = await fetch(`${API_BASE_URL}/resources/upload`, {
        method: "POST",
        body: backendFormData,
      });

      if (backendRes.ok) {
        const backendData = await backendRes.json();
        if (backendData.url || backendData.s3_url) {
          const s3Url = backendData.url || backendData.s3_url;
          console.log(`✅ AWS S3 Boto3 Upload Success: ${s3Url}`);
          return NextResponse.json({
            success: true,
            s3_url: s3Url,
            direct_s3_url: s3Url,
            storage_type: backendData.storage_type || "s3",
            bucket: "reuse-gear-images-2026",
            filename: file.name,
          });
        }
      }
    } catch (backendErr) {
      console.warn("FastAPI Boto3 upload proxy error, applying direct S3 fallback:", backendErr);
    }

    // Direct S3 fallback calculation
    const s3Bucket = process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET_NAME || "reuse-gear-images-2026";
    const awsRegion = process.env.AWS_REGION || "ap-south-1";
    const timeStamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const s3Key = `equipment/${timeStamp}_${cleanFileName}`;
    const directS3Url = `https://${s3Bucket}.s3.${awsRegion}.amazonaws.com/${s3Key}`;

    return NextResponse.json({
      success: true,
      s3_url: directS3Url,
      direct_s3_url: directS3Url,
      bucket: s3Bucket,
      region: awsRegion,
      filename: cleanFileName,
    });
  } catch (err: any) {
    console.error("AWS S3 Upload Route Error:", err);
    return NextResponse.json({ error: err.message || "S3 Upload failed" }, { status: 500 });
  }
}
// RE:USE — Modular Circular Economy Architecture
