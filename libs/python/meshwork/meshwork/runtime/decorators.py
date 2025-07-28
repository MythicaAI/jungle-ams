import logging
import sys
from functools import wraps

from fastapi import Request
from opentelemetry import trace
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator
from sqlalchemy import event
from sqlmodel.ext.asyncio.session import AsyncSession

log = logging.getLogger(__name__)

tracer = trace.get_tracer(__name__)


def propagate_telemetry_context(func):
    "Propagates telemetry context from headers to root"

    def wrapper(*args, **kwargs):
        request: Request = args[1]
        context = TraceContextTextMapPropagator().extract(carrier=dict(request.headers))
        with tracer.start_as_current_span("request", context=context):
            result = func(*args, **kwargs)
        return result

    return wrapper


def log_sql_queries(func):
    """Decorator to log SQL queries executed by a function"""

    @wraps(func)
    async def wrapper(*args, **kwargs):
        db_session = kwargs.get("db_session")
        if db_session is None:
            for arg in args:
                if isinstance(arg, AsyncSession):
                    db_session = arg
                    break

        if db_session is None:
            raise ValueError("No AsyncSession found in arguments")

        queries = []

        def after_cursor_execute(
            conn, cursor, statement, parameters, context, executemany
        ):
            queries.append(statement)

        event.listen(
            db_session.sync_session.bind, "after_cursor_execute", after_cursor_execute
        )

        try:
            result = await func(*args, **kwargs)
        finally:
            event.remove(
                db_session.sync_session.bind,
                "after_cursor_execute",
                after_cursor_execute,
            )

        if "pytest" in sys.argv[0] or "pytest" in sys.modules:
            log.info("Executed SQL queries: %s", queries)
            print("Executed SQL queries: %s", queries)

        return result

    return wrapper
