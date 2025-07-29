from typing import List, Tuple

from starlette.types import ASGIApp, Receive, Scope, Send

Headers = List[Tuple[bytes, bytes]]


class ProxiedHeadersMiddleware:
    """
    A middleware that modifies the request to ensure that FastAPI uses the
    X-Forwarded-* headers when creating URLs used to reference this application.

    We are very permissive in allowing all X-Forwarded-* headers to be used, as
    we know that this API will be published behind the API Gateway, and is
    therefore not prone to redirect hijacking.

    """

    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        headers = dict(scope.get("headers", {}))
        remap_headers(headers)

        # replace the scheme if behind TLS termination
        if b"x-forwarded-proto" in headers:
            print("re-writing scheme")
            scope["scheme"] = headers[b"x-forwarded-proto"].decode("ascii")

        # rewrite to tuple based headers format
        scope["headers"] = [(k, v) for k, v in headers.items()]

        await self.app(scope, receive, send)
        return


def remap_headers(source_headers: dict) -> None:
    """
    Map X-Forwarded-Host to host and X-Forwarded-Prefix to prefix.
    """
    if b"x-forwarded-host" in source_headers:
        source_headers.update({b"host": source_headers[b"x-forwarded-host"]})
        source_headers.pop(b"x-forwarded-host")

    if b"x-forwarded-prefix" in source_headers:
        source_headers.update({
            b"host": source_headers[b"host"] + source_headers[b"x-forwarded-prefix"]
        })
        source_headers.pop(b"x-forwarded-prefix")
