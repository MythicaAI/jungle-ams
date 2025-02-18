import pytest
from unittest import mock
from unittest.mock import MagicMock, patch, Mock
from validate_email.verification import send_validating_email, EmailVerificationException


# Mock the logger
@pytest.fixture
def mock_logger():
    with mock.patch("validate_email.verification.log") as mock_log:
        yield mock_log


def test_send_validating_email_success(mock_mail_send_success: MagicMock, mock_logger):
    # Arrange: Set up the mock to return a mock response
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.body = "Email sent successfully"
    mock_response.headers = {'Content-Type': 'application/json'}
    
    # Set the mock response to be returned when _send_email is called
    mock_mail_send_success.return_value = mock_response

    verification_link = "https://mythica.com/verify?token=1234"
    to_emails = "user@example.com"

    result = send_validating_email(verification_link, to_emails)

    mock_mail_send_success.assert_called_once_with(mock.ANY)

    assert result is True

    assert mock_mail_send_success.return_value.status_code == 200
    assert mock_mail_send_success.return_value.body == "Email sent successfully"

    mock_logger.info.assert_called_with("Verification email is sent to: %s", to_emails)


@patch('sendgrid.SendGridAPIClient.send')
def test_send_validating_email_failure(mock_mail_send, mock_logger):
    # Arrange: Set up the mock to return a failure response (e.g., 400)
    mock_response = Mock()
    mock_response.status_code = 400  # Simulate a failure response code
    mock_response.body = "Bad Request"
    mock_response.headers = {'Content-Type': 'application/json'}
    
    # Set the mock response to be returned when _send_email is called
    mock_mail_send.return_value = mock_response

    verification_link = "https://mythica.com/verify?token=1234"
    to_emails = "user@example.com"

    # Act: Call the send_validating_email function
    result = send_validating_email(verification_link, to_emails)

    # Assert: Check if SendGrid's send method was called with the expected message
    mock_mail_send.assert_called_once_with(mock.ANY)  # Ensure it was called with any request body

    # Assert: Check the behavior of the result, e.g., if it's False on failure
    assert result is False

    # Assert: Check if the response has the expected failure status code and body
    assert mock_mail_send.return_value.status_code == 400
    assert mock_mail_send.return_value.body == "Bad Request"

    # Optionally, check if the logger was called with the expected error message
    mock_logger.error.assert_called_with("Verification email failed for: %s, response.body: %s", to_emails, mock_response.body)


@patch('sendgrid.SendGridAPIClient.send')
def test_send_validating_email_exception(mock_mail_send, mock_logger):
    # Arrange: Set up the mock to raise an exception (e.g., EmailVerificationException)
    mock_mail_send.side_effect = EmailVerificationException("Error sending email")

    verification_link = "https://mythica.com/verify?token=1234"
    to_emails = "user@example.com"

    # Act: Call the send_validating_email function
    result = send_validating_email(verification_link, to_emails)

    # Assert: Check if SendGrid's send method was called with the expected message
    mock_mail_send.assert_called_once_with(mock.ANY)  # Ensure it was called with any request body

    # Assert: Check the behavior of the result, e.g., if it's False on exception
    assert result is False

    # Optionally, check if the exception was logged correctly
    mock_logger.error.assert_called_with("Error on sending verification email")
