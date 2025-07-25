import logging
from enum import Enum

import requests

from meshwork.config import meshwork_config

log = logging.getLogger(__name__)


class AlertSeverity(Enum):
    CRITICAL = "❌ Critical"
    ERROR = "🚨 Error"
    WARNING = "⚠️ Warning"
    INFO = "ℹ️ Info"
    SUCCESS = "✅ Success"
    DEBUG = "🐞 Debug"


def send_alert(message: str, severity: AlertSeverity = AlertSeverity.INFO) -> None:
    """Send an alert to the alerting system with emoji-based severity levels."""
    severity_enum = (
        severity if isinstance(severity, AlertSeverity) else AlertSeverity.INFO
    )

    json_data = {
        "content": f"{severity_enum.value}\n{message}",
    }

    webhook = meshwork_config().discord_infra_alerts_webhook
    if not webhook:
        log.info("(test) send_alert: %s", json_data)
        return

    headers = {
        "Content-Type": "application/json",
    }

    response = requests.post(webhook, json=json_data, headers=headers, timeout=5)
    if response.status_code in [200, 201]:
        log.debug("Alert sent: %s", response.status_code)
    else:
        log.error("Failed to send alert: %s", response.status_code)
