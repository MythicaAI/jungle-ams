import asyncio
import json
import logging
import os
import tempfile
import nats
import uuid
import importlib
import threading

from http import HTTPStatus
from cryptid import location
from pydantic import BaseModel, Field

# ––– import your workflow parser and models –––
from ripple.automation.utils import nats_submit
from ripple.automation.publishers import ResultPublisher
from ripple.models.params import ParameterSet, FileParameter
from ripple.models.streaming import OutputFiles
import ripple.automation.workflow as wk  # our earlier parse() function

importlib.reload(wk)
log = logging.getLogger(__name__)

NATS_URL = os.environ.get('NATS_ENDPOINT', 'nats://localhost:4222')
STATUS_SUBJECT = "result"
ENVIRONMENT = os.getenv('MYTHICA_ENVIRONMENT', 'debug')
LOCATION = location.location()
PROCESS_GUID = str(uuid.uuid4())

###############################################################################
# Helpers for workflow execution
###############################################################################

def parse_automation_field(automation: str) -> tuple[str, str]:
    """
    Parse the automation field string.
    
    For example, given "houdini://mythica/hda", return:
      worker: "houdini"
      path:    "/mythica/hda"
    """
    parts = automation.split("://")
    if len(parts) != 2:
        raise ValueError(f"Invalid automation field format: {automation}")
    worker = parts[0]
    # Ensure the path begins with a slash.
    path = "/" + parts[1].lstrip("/")
    if path == "/houdini/hda":
        path = "/mythica/hda_run"   
    return worker, path

def is_executable(node) -> bool:
    """
    Returns True if the node has been executed.
    For executable nodes (e.g. type "hdaWorker" or "worker"),
    we expect node.data["executionData"]["state"] == "done".
    For non-executable nodes, we simply return True.
    """
    if node.type in ["hdaWorker", "worker"]:
        return True
    return False

def is_executed(node) -> bool:
    """
    Returns True if the node has been executed.
    For executable nodes (e.g. type "hdaWorker" or "worker"),
    we expect node.data["executionData"]["state"] == "done".
    For non-executable nodes, we simply return True.
    """
    if is_executable(node):
        ed = node.data.get("executionData")
        return ed is not None and ed.get("state") == "done"
    return True


def is_ready(node) -> bool:
    """
    A node is considered ready if all its parent nodes have been executed.
    """
    return all(is_executed(parent) for parent in node.parents)


###############################################################################
# Asynchronous helpers and coordinator logic
###############################################################################

async def _runAutomation_async(request: 'RequestModel', reporter: ResultPublisher) -> 'ResponseModel':
    """
    Asynchronous version of the coordinator logic.
    This function contains the same logic as before but is written as a coroutine.
    """
    # Load workflow JSON from the provided file.
    with open(request.awful.file_path, "r", encoding="utf-8") as f:
        awful = json.load(f)

    # Parse the workflow into our graph representation.
    workflow = wk.parse(awful)

    # Process nodes until no more executable nodes are ready.
    nodes_to_execute = [
        node for node in workflow.get_start_nodes()
        if is_executable(node) and not is_executed(node) and is_ready(node)
    ]
    try:
        while nodes_to_execute:
            log.info("Ready nodes to execute: %s", [node.id for node in nodes_to_execute])
            for node in nodes_to_execute:
                automation_field = node.data.get("automation")
                if not automation_field:
                    log.warning("Node %s has no automation field. Skipping.", node.id)
                    continue
                channel, path = parse_automation_field(automation_field)
                input_data = node.data.get("inputData", {})
                
                correlation = node.id  # Use the node id as the correlation id

                log.info("Executing node %s via channel %s at path %s", node.id, channel, path)
                result = nats_submit(
                    channel,
                    path,
                    input_data,
                    correlation,
                    auth_token=reporter.profile.auth_token
                )
                # Check for error result: if item_type is "message", treat it as an error.
                if result.get("item_type") == "message":
                    error_msg = result.get("message", "Unknown error")
                    log.error("Error executing node %s: %s", node.id, error_msg)
                    # Raise an exception to break out of the entire execution.
                    raise Exception(f"Error executing node {node.id}: {error_msg}")

                log.info("Node %s executed; result: %s", node.id, result)
                node.data["executionData"] = result
                # TODO: make reporter.publish method and this method async
                reporter.publish(f"Node {node.id} executed", result)

            for node in nodes_to_execute:
                if is_executed(node):
                    nodes_to_execute.remove(node)
                    for child in node.children:
                        if is_executable(child) and is_ready(child):
                            nodes_to_execute.append(child)
    except Exception as exc:
        log.error("Error executing workflow %s", exc)
        

    workflow_dict = {
        "flow": {
            "nodes": [node.model_dump() for node in workflow.nodes.values()],
            "edges": [edge.model_dump() for edge in workflow.edges]
        }
    }

    tmpdirname = tempfile.mkdtemp()
    base = os.path.basename(request.awful.file_path)
    code_file_name = os.path.join(tmpdirname, base.replace(".awful", "exec.awful"))
    with open(code_file_name, "w", encoding="utf-8") as file:
        file.write(json.dumps(workflow_dict, indent=2))
    log.info("Updated workflow written to: %s", code_file_name)

    return ResponseModel(files={"Workflows": [code_file_name]})


###############################################################################
# A helper to run async coroutines in a new event loop in a separate thread
###############################################################################

def run_async(coro) -> any:
    """
    Run an async coroutine in a new event loop in a separate thread.
    Returns the result of the coroutine.
    """
    result_container = []
    exception_container = []

    def _run():
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            result = loop.run_until_complete(coro)
            result_container.append(result)
        except Exception as e:
            exception_container.append(e)
        finally:
            loop.close()

    thread = threading.Thread(target=_run)
    thread.start()
    thread.join()

    if exception_container:
        raise exception_container[0]
    return result_container[0]


###############################################################################
# Synchronous coordinator function (signature remains unchanged)
###############################################################################

class RequestModel(ParameterSet):
    awful: FileParameter  # This points to a file containing the workflow JSON


class ResponseModel(OutputFiles):
    files: dict[str, list[str]] = Field(default_factory=lambda: {"Workflows": []})


def runAutomation(request: RequestModel, reporter: ResultPublisher) -> ResponseModel:
    """
    Synchronous coordinator that loads the workflow, executes ready nodes by
    dispatching async NATS calls (via a helper coroutine run in a separate thread),
    updates the workflow, and writes out the updated workflow.
    """
    return run_async(_runAutomation_async(request, reporter))
