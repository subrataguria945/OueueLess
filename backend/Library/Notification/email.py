import requests
import os
from dotenv import load_dotenv

load_dotenv()

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL", "jainkushal556@gmail.com")

def send_otp_email(to_email: str, otp: str):
    url = "https://api.brevo.com/v3/smtp/email"

    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; padding: 40px 15px; margin: 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 460px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
            <tr>
                <td style="padding: 40px 32px 32px 32px;">
                    <div style="font-size: 19px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px; margin-bottom: 20px;">
                        QueueLess
                    </div>
                    <div style="font-size: 22px; font-weight: 700; color: #1e293b; line-height: 1.3; margin-bottom: 12px;">
                        Confirm your email address
                    </div>
                    <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 28px 0;">
                        Use the verification code below to complete your registration. This code will expire in <strong style="color: #0f172a;">5 minutes</strong>.
                    </p>
                    <div style="background: #f1f5f9; border-radius: 10px; border: 1px solid #cbd5e1; padding: 18px 24px; text-align: center; margin-bottom: 24px;">
                        <span title="Click to select code" style="font-family: 'SF Mono', Consolas, Menlo, monospace; font-size: 32px; font-weight: 700; letter-spacing: 10px; color: #0f172a; user-select: all; -webkit-user-select: all; cursor: pointer; display: inline-block;">{otp}</span>
                        <div style="font-size: 12px; color: #64748b; margin-top: 6px; font-weight: 500;">Click code to select & copy</div>
                    </div>
                    <p style="font-size: 13px; line-height: 20px; color: #64748b; margin: 0 0 24px 0;">
                        <strong style="color: #334155;">Security Notice:</strong> Never share this code with anyone. QueueLess employees will never ask for your verification code.
                    </p>
                    <div style="height: 1px; background-color: #f1f5f9; margin-bottom: 20px;"></div>
                    <p style="font-size: 12px; line-height: 18px; color: #94a3b8; margin: 0;">
                        If you didn't request this verification code, you can safely ignore this email.
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
    }

    payload = {
        "sender": {"name": "QueueLess", "email": SENDER_EMAIL},
        "to": [{"email": to_email}],
        "subject": f"{otp} is your QueueLess Verification Code",
        "htmlContent": html_content
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code in [200, 201]:
            print(f"OTP successfully sent to {to_email} via Brevo")
            return True
        else:
            print(f"Brevo API error: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
        return False

