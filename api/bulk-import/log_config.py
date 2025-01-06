import logging
import logging.config
import sys
from typing import Optional


def log_config(log_level: str = "INFO",
               log_format: Optional[str] = None) -> None:
    """
    Set up logging configuration suitable for both Docker and CLI usage.

    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_format: Optional custom log format string
    """
    if log_format is None:
        log_format = (
            "%(asctime)s.%(msecs)03d [%(levelname)s] %(name)s - "
            "%(module)s:%(lineno)d - %(message)s"
        )
    third_party_loggers = {
        "requests": "WARNING",
        "urllib3": "WARNING"
    }
    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "standard": {
                "format": log_format,
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "standard",
                "stream": sys.stdout,
            },
        },
        "loggers": {
            "": {  # Root logger
                "handlers": ["console"],
                "level": log_level,
                "propagate": True,
            },
            # Add third-party logger configurations
            **{
                logger_name: {
                    "level": level,
                    "propagate": True,
                }
                for logger_name, level in third_party_loggers.items()
            }
        },
    }

    logging.config.dictConfig(logging_config)
