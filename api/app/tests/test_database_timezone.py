"""Tests for the timezone detection and conversion"""

from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo


def coerce_str_datetime(tz):
    tz_aware = datetime.now(timezone.utc).astimezone(tz)
    naive = tz_aware.replace(tzinfo=None)
    timestamp = str(naive)
    return timestamp


def test_database_timezone():
    tz_casey = ZoneInfo('Antarctica/Casey')
    tz_utc = timezone.utc
    tz_pacific = ZoneInfo('US/Pacific')

    # available = available_timezones()
    # consider timestamps that don't have timezone information as some databases can
    # not provide a timestamp that is auto-populating and timezone aware
    timestamp_utc = coerce_str_datetime(tz_utc)
    timestamp_casey = coerce_str_datetime(tz_casey)
    timestamp_pdt = coerce_str_datetime(tz_pacific)

    # timestamps that have come out of the database without full ISO timezone information
    from_db_utc = datetime.fromisoformat(timestamp_utc)
    from_db_casey = datetime.fromisoformat(timestamp_casey)
    from_db_pdt = datetime.fromisoformat(timestamp_pdt)

    # replace with the configured timestamp (normally from app_config()) move to UTC
    # this is how the API moves database time configured for a timezone into UTC time
    # all of these timestamps should be very close after the shift
    pdt_in_utc = from_db_pdt.replace(tzinfo=tz_pacific).astimezone(timezone.utc)
    utc_in_utc = from_db_utc.replace(tzinfo=tz_utc).astimezone(timezone.utc)
    casey_in_utc = from_db_casey.replace(tzinfo=tz_casey).astimezone(timezone.utc)

    def abs_delta_close(utc_datetime):
        # Calculating the timedelta after shifting into utc
        delta_from_utc = utc_in_utc - utc_datetime

        # Allowing for a small error margin (e.g., 1 second)
        error_margin = timedelta(seconds=1)

        # Comparison with margin of error
        are_deltas_close = abs(delta_from_utc) <= error_margin
        return are_deltas_close

    assert abs_delta_close(pdt_in_utc)
    assert abs_delta_close(utc_in_utc)
    assert abs_delta_close(casey_in_utc)
