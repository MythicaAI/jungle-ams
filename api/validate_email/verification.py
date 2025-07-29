import logging
from typing import Union

from config import app_config
from opentelemetry import trace
from opentelemetry.context import get_current as get_current_telemetry_context
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

sg = SendGridAPIClient(app_config().sendgrid_api_key)

log = logging.getLogger(__name__)


class EmailVerificationException(Exception):
    def __init__(self, message):
        super().__init__(message)


def send_validating_email(
    verification_link: str, to_emails: Union[str, tuple, list]
) -> bool:
    message = Mail(
        from_email=app_config().sendgrid_email,
        to_emails=to_emails,
        subject="🔐 Verify Your Email Address on Mythica",
        html_content=EMAIL_VERIFICATION_TEMPLATE.format(
            verification_link=verification_link
        ),
    )
    try:
        response = sg.send(message)
        if response.status_code >= 400:
            log.error(
                "Verification email failed for: %s, response.body: %s",
                str(to_emails),
                str(response.body),
            )
            return False
        log.info("Verification email is sent to: %s", str(to_emails))
        return True
    except EmailVerificationException as ex:
        span = trace.get_current_span(context=get_current_telemetry_context())
        span.record_exception(ex)
        log.error("Error on sending verification email")
        return False


EMAIL_VERIFICATION_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Email Verification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <!-- Logo Section -->
                <table role="presentation" width="500" cellspacing="0" cellpadding="0" border="0" style="background-color: #000000; padding: 20px; border-radius: 8px 8px 0 0;">
                    <tr>
                        <td align="center">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td align="center" style="padding-right: 10px;">
                                        <img src="https://api.mythica.ai/mythica-logo.png" alt="Mythica Logo1" width="40" style="display: inline-block; vertical-align: middle;">
                                    </td>
                                    <td align="center">
                                        <img src="https://api.mythica.ai/mythica-text-logo.png" alt="Mythica Logo2" width="200" style="display: inline-block; vertical-align: middle;">
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Email Content -->
                <table role="presentation" width="500" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #dddddd;">
                    <tr>
                        <td align="center" style="padding: 20px;">
                            <h2 style="color: #333333; font-family: Arial, sans-serif; margin: 0;">Verify Your Email</h2>
                            <p style="color: #555555; font-size: 16px; font-family: Arial, sans-serif;">Click the button below to verify your email address.</p>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td align="center" bgcolor="#007BFF" style="border-radius: 5px;">
                                        <a href="{verification_link}" target="_blank" style="display: inline-block; padding: 12px 20px; font-size: 16px; font-family: Arial, sans-serif; color: #ffffff; background-color: #007BFF; text-decoration: none; border-radius: 5px;">Verify Email</a>
                                    </td>
                                </tr>
                            </table>
                            <p style="color: #888888; font-size: 14px; font-family: Arial, sans-serif;">If you didn’t request this, ignore this email.</p>
                            <p style="color: #333333; font-size: 14px; font-family: Arial, sans-serif;">Thank you,<br> The Mythica Team</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""
