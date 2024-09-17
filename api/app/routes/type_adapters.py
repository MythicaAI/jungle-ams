from psycopg2.extensions import register_adapter, AsIs, QuotedString
from pydantic.networks import IPv4Address, IPv6Address
from pydantic import AnyUrl


def adapt_pydantic_url(any_http_url: AnyUrl) -> QuotedString:
    """Adapt URLs to be stored in the database"""
    return QuotedString(str(any_http_url))


def adapt_pydantic_ip(ip: IPv4Address | IPv6Address) -> AsIs:
    """Adapt IP addresses to be stored in the database"""
    return AsIs(repr(ip.exploded))


def register_adapters():
    """Register all route specific adapters"""
    register_adapter(AnyUrl, adapt_pydantic_url)
    register_adapter(IPv4Address, adapt_pydantic_ip)
    register_adapter(IPv6Address, adapt_pydantic_ip)
