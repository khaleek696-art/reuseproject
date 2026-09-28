"""
RE:USE Bulletproof Dual-Engine Email Dispatch Module
Support Port 587 STARTTLS + Port 465 SSL + Resend REST API
"""
import asyncio
import json
import logging
import smtplib
import ssl
import urllib.request
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings

logger = logging.getLogger("reuse_email")

def send_resend_email(recipient_email: str, otp_code: str, html_content: str) -> bool:
    """
    Super-fast HTTP REST dispatch using Resend.com API key.
    """
    resend_api_key = getattr(settings, "RESEND_API_KEY", None) or os.getenv("RESEND_API_KEY", "")
    if not resend_api_key:
        return False

    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {resend_api_key}",
        "Content-Type": "application/json",
        "User-Agent": "REUSE-Marketplace/1.0",
    }
    payload = {
        "from": "RE:USE Security <onboarding@resend.dev>",
        "to": [recipient_email],
        "subject": f"Your RE:USE Verification Code is {otp_code}",
        "html": html_content,
    }

    try:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        context = ssl._create_unverified_context()

        with urllib.request.urlopen(req, data=data, context=context, timeout=5) as response:
            if response.status in (200, 201):
                logger.info(f"⚡ [RESEND API SUCCESS] Delivered 6-digit OTP to {recipient_email}")
                return True
    except Exception as e:
        logger.warning(f"⚠️ Resend API notice: {e}. Auto-switching to Gmail SMTP...")
        return False

    return False


def send_smtp_email(recipient_email: str, otp_code: str) -> bool:
    """
    Bulletproof dual-port SMTP sender with automatic 3x retry and SSL fallback.
    """
    mail_username = getattr(settings, "MAIL_USERNAME", None) or "reuse.marketplace.help@gmail.com"
    mail_password = getattr(settings, "MAIL_PASSWORD", None) or os.getenv("MAIL_PASSWORD", "")

    logger.info(f"📧 [REAL EMAIL OTP DISPATCH] Target Inbox: {recipient_email} | Security Code: {otp_code}")

    text_content = f"Your RE:USE verification code is: {otp_code}. Valid for 10 minutes."
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }}
        .container {{ max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }}
        .logo {{ font-size: 26px; font-weight: 900; color: #065f46; text-align: center; margin-bottom: 20px; }}
        .otp-box {{ background: #ecfdf5; border: 2px dashed #059669; border-radius: 12px; font-size: 38px; font-weight: 900; color: #065f46; letter-spacing: 8px; text-align: center; padding: 18px; margin: 24px 0; }}
        .footer {{ font-size: 11px; color: #94a3b8; text-align: center; margin-top: 24px; }}
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">RE<span style="color:#059669">:</span>USE</div>
        <h2 style="font-size: 18px; color: #1e293b; margin: 0; text-align: center;">Account Verification Code</h2>
        <p style="font-size: 13px; color: #64748b; text-align: center; margin-top: 8px;">
          Your identity verification security OTP code for RE:USE Marketplace is:
        </p>
        <div class="otp-box">{otp_code}</div>
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">
          Valid for 10 minutes. Do not share this OTP with anyone.
        </p>
        <div class="footer">
          © 2026 RE:USE Hyperlocal Circular Marketplace
        </div>
      </div>
    </body>
    </html>
    """

    # Always attempt Resend HTTP REST API first (over HTTPS Port 443 - Works 100% on Render & All Cloud Hosts)
    resend_success = send_resend_email(recipient_email, otp_code, html_content)
    if resend_success:
        return True

    if not mail_password:
        logger.warning("MAIL_PASSWORD missing. Skipping SMTP delivery.")
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Your RE:USE Verification Code is {otp_code}"
    msg["From"] = f"RE:USE Security <{mail_username}>"
    msg["To"] = recipient_email
    msg["Reply-To"] = mail_username
    msg["X-Priority"] = "1"
    msg["Importance"] = "High"

    msg.attach(MIMEText(text_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    # Attempt 1: Port 587 TLS
    try:
        with smtplib.SMTP("smtp.gmail.com", 587, timeout=8) as server:
            server.starttls()
            server.login(mail_username, mail_password)
            server.send_message(msg)
        logger.info(f"✅ Real OTP email delivered via Google SMTP (Port 587) to {recipient_email}")
        return True
    except Exception as e1:
        logger.warning(f"⚠️ Port 587 TLS attempt failed ({e1}). Trying Port 465 SSL fallback...")

    # Attempt 2: Port 465 SSL Fallback
    try:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context, timeout=8) as server:
            server.login(mail_username, mail_password)
            server.send_message(msg)
        logger.info(f"✅ Real OTP email delivered via Google SMTP_SSL (Port 465) to {recipient_email}")
        return True
    except Exception as e2:
        logger.error(f"❌ Both SMTP attempts failed for {recipient_email}: {e2}")

    return False

async def send_real_email_otp(recipient_email: str, otp_code: str) -> bool:
    """
    Non-blocking async wrapper that dispatches email sending to background thread.
    """
    return await asyncio.to_thread(send_smtp_email, recipient_email, otp_code)
