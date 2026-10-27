import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import resend
import os
from dotenv import load_dotenv

load_dotenv()

# def send_otp_email(to_email: str, otp: str):
#     smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
#     smtp_port = int(os.getenv("SMTP_PORT", 587))
#     smtp_user = os.getenv("SMTP_USER")
#     smtp_pass = os.getenv("SMTP_PASSWORD")

#     msg = MIMEMultipart("alternative")
#     msg["Subject"] = f"{otp} is your QueueLess Verification Code"
#     msg["From"] = f"QueueLess <{smtp_user}>"
#     msg["To"] = to_email

#     # Plain-text version for email clients and spam filter compliance
#     text_content = f"QueueLess Verification Code\n\nYour OTP code is: {otp}\nThis code is valid for 5 minutes.\n\nNever share this code with anyone.\nIf you did not request this code, please ignore this email."
#     msg.attach(MIMEText(text_content, "plain"))

#     # Minimalist, Ultra-Premium SaaS Template (Stripe / Linear / Vercel style)
#     html_content = f"""
#     <!DOCTYPE html>
#     <html lang="en">
#     <head>
#         <meta charset="utf-8">
#         <meta name="viewport" content="width=device-width, initial-scale=1.0">
#     </head>
#     <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; padding: 40px 15px; margin: 0; -webkit-font-smoothing: antialiased;">
#         <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 460px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
#             <tr>
#                 <td style="padding: 40px 32px 32px 32px;">
                    
#                     <!-- Header -->
#                     <div style="font-size: 19px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px; margin-bottom: 20px;">
#                         QueueLess
#                     </div>
                    
#                     <!-- Title -->
#                     <div style="font-size: 22px; font-weight: 700; color: #1e293b; line-height: 1.3; margin-bottom: 12px;">
#                         Confirm your email address
#                     </div>
                    
#                     <!-- Subtitle -->
#                     <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 28px 0;">
#                         Use the verification code below to complete your registration. This code will expire in <strong style="color: #0f172a;">5 minutes</strong>.
#                     </p>
                    
#                     <!-- OTP Code Container (Clicking selects the entire 6-digit code for instant copying) -->
#                     <div style="background: #f1f5f9; border-radius: 10px; border: 1px solid #cbd5e1; padding: 18px 24px; text-align: center; margin-bottom: 24px;">
#                         <span title="Click to select code" style="font-family: 'SF Mono', Consolas, Menlo, Monaco, monospace; font-size: 32px; font-weight: 700; letter-spacing: 10px; color: #0f172a; user-select: all; -webkit-user-select: all; -moz-user-select: all; cursor: pointer; display: inline-block;">{otp}</span>
#                         <div style="font-size: 12px; color: #64748b; margin-top: 6px; font-weight: 500;">Click code to select & copy</div>
#                     </div>

#                     <!-- Security Alert -->
#                     <p style="font-size: 13px; line-height: 20px; color: #64748b; margin: 0 0 24px 0;">
#                         <strong style="color: #334155;">Security Notice:</strong> Never share this code with anyone. QueueLess employees will never ask for your verification code.
#                     </p>

#                     <div style="height: 1px; background-color: #f1f5f9; margin-bottom: 20px;"></div>

#                     <!-- Footer -->
#                     <p style="font-size: 12px; line-height: 18px; color: #94a3b8; margin: 0;">
#                         If you didn't request this verification code, you can safely ignore this email.
#                     </p>
#                 </td>
#             </tr>
#         </table>
#     </body>
#     </html>
#     """
#     msg.attach(MIMEText(html_content, "html"))

#     try:
#         if smtp_port == 465:
#             with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
#                 server.login(smtp_user, smtp_pass)
#                 server.sendmail(smtp_user, to_email, msg.as_string())
#         else:
#             with smtplib.SMTP(smtp_host, smtp_port) as server:
#                 server.starttls()
#                 server.login(smtp_user, smtp_pass)
#                 server.sendmail(smtp_user, to_email, msg.as_string())
#         print(f"OTP successfully sent to {to_email}")
#         return True
#     except Exception as e:
#         print(f"Failed to send email to {to_email}: {e}")
#         return False


resend.api_key = os.getenv("RESEND_API_KEY")

def send_otp_email(to_email: str, otp: str):
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 40px 15px; margin: 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 460px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0;">
            <tr>
                <td style="padding: 35px 30px;">
                    <div style="font-size: 19px; font-weight: 700; color: #0f172a; margin-bottom: 20px;">QueueLess</div>
                    <div style="font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 12px;">Confirm your email address</div>
                    <p style="font-size: 15px; line-height: 24px; color: #475569; margin: 0 0 24px 0;">Use the verification code below to complete your registration. This code will expire in <strong>5 minutes</strong>.</p>
                    <div style="background: #f1f5f9; border-radius: 10px; border: 1px solid #cbd5e1; padding: 18px; text-align: center; margin-bottom: 20px;">
                        <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0f172a;">{otp}</span>
                    </div>
                    <p style="font-size: 13px; color: #64748b; margin: 0;"><strong>Security Notice:</strong> Never share this code with anyone.</p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    try:
        # HTTPS (Port 443) দিয়ে যায়, তাই Render-এ কখনো আটকাবে না
        params = {
            "from": "QueueLess <onboarding@resend.dev>",
            "to": [to_email],
            "subject": f"{otp} is your QueueLess Verification Code",
            "html": html_content,
        }
        resend.Emails.send(params)
        print(f"OTP successfully sent to {to_email} via Resend")
        return True
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
        return False
