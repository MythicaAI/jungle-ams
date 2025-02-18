# pylint: disable=unused-argument

from unittest import mock
from unittest.mock import MagicMock, Mock, patch

from validate_email.verification import (
    EmailVerificationException,
    send_validating_email,
)


@patch("validate_email.verification.log")
def test_send_validating_email_success(mock_logger, mock_mail_send_success: MagicMock):
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.body = "Email sent successfully"
    mock_response.headers = {'Content-Type': 'application/json'}

    mock_mail_send_success.return_value = mock_response

    verification_link = "https://mythica.com/verify?token=1234"
    to_emails = "user@example.com"

    result = send_validating_email(verification_link, to_emails)

    mock_mail_send_success.assert_called_once_with(mock.ANY)

    assert result is True

    assert mock_mail_send_success.return_value.status_code == 200
    assert mock_mail_send_success.return_value.body == "Email sent successfully"

    mock_logger.info.assert_called_with("Verification email is sent to: %s", to_emails)


@patch("validate_email.verification.log")
@patch('sendgrid.SendGridAPIClient.send')
def test_send_validating_email_failure(mock_mail_send, mock_logger):
    mock_response = Mock()
    mock_response.status_code = 400
    mock_response.body = "Bad Request"
    mock_response.headers = {'Content-Type': 'application/json'}

    mock_mail_send.return_value = mock_response

    verification_link = "https://mythica.com/verify?token=1234"
    to_emails = "user@example.com"

    result = send_validating_email(verification_link, to_emails)

    mock_mail_send.assert_called_once_with(mock.ANY)

    assert result is False

    assert mock_mail_send.return_value.status_code == 400
    assert mock_mail_send.return_value.body == "Bad Request"

    mock_logger.error.assert_called_with(
        "Verification email failed for: %s, response.body: %s",
        to_emails,
        mock_response.body,
    )


@patch("validate_email.verification.log")
@patch('sendgrid.SendGridAPIClient.send')
def test_send_validating_email_exception(mock_mail_send, mock_logger):
    mock_mail_send.side_effect = EmailVerificationException("Error sending email")

    verification_link = "https://mythica.com/verify?token=1234"
    to_emails = "user@example.com"

    result = send_validating_email(verification_link, to_emails)

    mock_mail_send.assert_called_once_with(mock.ANY)

    assert result is False

    mock_logger.error.assert_called_with("Error on sending verification email")
