"""
RE:USE Platform S3 & Local File Storage Engine
Handles document (KYC ID Proofs) and item photo uploads.
Uploads to AWS S3 bucket when credentials exist, with fallback to local disk storage.
"""
import os
import uuid
import logging
from typing import Tuple

from app.core.config import settings

logger = logging.getLogger("reuse_storage")

# Create local uploads folder fallback
LOCAL_UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(LOCAL_UPLOADS_DIR, exist_ok=True)


async def upload_file_to_s3_or_local(
    file_bytes: bytes,
    original_filename: str,
    folder_prefix: str = "kyc"
) -> Tuple[bool, str, str]:
    """
    Uploads a file to AWS S3 if credentials are configured,
    otherwise saves locally as a reliable fallback.

    Returns:
        Tuple[bool, str, str]: (success, file_url, storage_type)
    """
    ext = os.path.splitext(original_filename)[1] or ".png"
    unique_filename = f"{folder_prefix}_{uuid.uuid4().hex[:8]}{ext}"

    # Check if AWS credentials exist
    if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
        try:
            import boto3

            s3_client = boto3.client(
                "s3",
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION,
            )

            s3_key = f"{folder_prefix}/{unique_filename}"
            s3_client.put_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=s3_key,
                Body=file_bytes,
                ContentType="image/jpeg" if ext.lower() in [".jpg", ".jpeg"] else "image/png",
            )

            s3_url = f"https://{settings.S3_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{s3_key}"
            logger.info(f"✅ Successfully uploaded file to AWS S3: {s3_url}")
            return True, s3_url, "s3"

        except Exception as e:
            logger.error(f"⚠️ AWS S3 Upload failed: {e}. Falling back to local storage.")

    # Local fallback
    local_path = os.path.join(LOCAL_UPLOADS_DIR, unique_filename)
    with open(local_path, "wb") as f:
        f.write(file_bytes)

    local_url = f"/static/uploads/{unique_filename}"
    logger.info(f"💾 File saved to local storage: {local_url}")
    return True, local_url, "local"
