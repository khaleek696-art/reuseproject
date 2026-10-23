"""
RE:USE Platform S3 & Local File Storage Engine
Handles item photos and document uploads using AWS Boto3 SDK.
Uploads directly to AWS S3 Bucket ('reuse-gear-images-2026') in ap-south-1.
"""
import os
import uuid
import logging
from typing import Tuple

from app.core.config import settings

logger = logging.getLogger("reuse_storage")

# Local fallback directory
LOCAL_UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(LOCAL_UPLOADS_DIR, exist_ok=True)


async def upload_file_to_s3_or_local(
    file_bytes: bytes,
    original_filename: str,
    folder_prefix: str = "equipment"
) -> Tuple[bool, str, str]:
    """
    Uploads a file to AWS S3 using Boto3 SDK.
    Generates a permanent, globally accessible public HTTPS URL.
    Falls back to local file storage only if AWS credentials fail.

    Returns:
        Tuple[bool, str, str]: (success, file_url, storage_type)
    """
    ext = os.path.splitext(original_filename)[1] or ".jpg"
    unique_filename = f"{folder_prefix}_{uuid.uuid4().hex[:10]}{ext}"

    # Determine Content-Type
    content_type = "image/jpeg"
    ext_lower = ext.lower()
    if ext_lower == ".png":
        content_type = "image/png"
    elif ext_lower == ".webp":
        content_type = "image/webp"
    elif ext_lower in [".jpg", ".jpeg"]:
        content_type = "image/jpeg"

    # AWS Boto3 S3 Upload
    if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
        try:
            import boto3

            s3_client = boto3.client(
                "s3",
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION or "ap-south-1",
            )

            bucket_name = settings.AWS_S3_BUCKET_NAME or settings.S3_BUCKET_NAME or "reuse-gear-images-2026"
            s3_key = f"{folder_prefix}/{unique_filename}"

            s3_client.put_object(
                Bucket=bucket_name,
                Key=s3_key,
                Body=file_bytes,
                ContentType=content_type,
            )

            s3_url = f"https://{bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{s3_key}"
            logger.info(f"✅ Boto3 Upload Success: {s3_url}")
            return True, s3_url, "s3"

        except Exception as e:
            logger.error(f"⚠️ AWS S3 Boto3 Upload error: {e}. Falling back to local storage.")

    # Local fallback
    local_path = os.path.join(LOCAL_UPLOADS_DIR, unique_filename)
    with open(local_path, "wb") as f:
        f.write(file_bytes)

    local_url = f"/static/uploads/{unique_filename}"
    logger.info(f"💾 File saved locally: {local_url}")
    return True, local_url, "local"
# RE:USE — Modular Circular Economy Architecture
