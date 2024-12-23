from asyncio import Task
from logging import Logger
import traceback


def format_exception(e: Exception) -> str:
    return f" {str(e)}\n{traceback.format_exc()}"

def error_handler(log: Logger) -> callable:
    def handler(task: Task):
        e = task.exception()
        if e:
            log.error(f"Error publishing result: {format_exception(e)}")
    return handler




