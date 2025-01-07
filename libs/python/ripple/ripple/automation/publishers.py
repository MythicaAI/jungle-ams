import logging
from typing import Any, Optional
from ripple.auth.generate_token import decode_token
from ripple.automation.adapters import NatsAdapter, RestAdapter
from ripple.automation.models import AutomationRequest
from ripple.config import ripple_config
from ripple.models.streaming import JobDefinition, OutputFiles, ProcessStreamItem

from ripple.automation.utils import error_handler
import asyncio
import os

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)

class ResultPublisher:
    """"
    Object that encapsulates streaming results back for a work request
    """
    request: AutomationRequest
    nats: NatsAdapter
    rest: RestAdapter

    def __init__(
            self, 
            request: AutomationRequest, 
            nats_adapter: NatsAdapter, 
            rest: RestAdapter, 
            directory: str
        ) -> None:
        self.request = request
        self.directory = directory
        self.profile = decode_token(request.auth_token)
        self.nats = nats_adapter
        self.rest = rest
        self.api_url = ripple_config().api_base_uri

    #Callback for reporting back. 
    def result(self, item: ProcessStreamItem, complete: bool=False):
        item.process_guid = self.request.process_guid
        item.correlation = self.request.work_guid
        item.job_id = self.request.job_id or ""

        # Upload any references to local data
        self._publish_local_data(item)

        job_result_endpoint=f"{self.api_url}/jobs/results"
        job_complete_endpoint=f"{self.api_url}/jobs/complete"

        # Publish results
        log.info(f"Job {'Result' if not complete else 'Complete'} -> {item}")

        task = asyncio.create_task(
            self.nats.post_to(
                "result",
                self.request.process_guid,
                item.model_dump()))

        task.add_done_callback(error_handler(log))
        if self.request.job_id:
            if complete:
                self.rest.post(
                    f"{job_complete_endpoint}/{self.request.job_id}",
                    json_data={},
                    token=self.request.auth_token,
                    headers=self.request.telemetry_context,
                )
                log.info(
                    "ResultPublisher-nats-post: url-%s; token-%s; headers-%s",
                    f"{job_complete_endpoint}/{self.request.job_id}",
                    self.request.auth_token,
                    self.request.telemetry_context,
                )
            else:
                data = {
                    "created_in": "automation-worker",
                    "result_data": item.model_dump()
                }
                self.rest.post(
                    f"{job_result_endpoint}/{self.request.job_id}",
                    json_data=data,
                    token=self.request.auth_token,
                    headers=self.request.telemetry_context,
                )
                log.info(
                    "ResultPublisher-nats-post: url-%s; token-%s; headers-%s; json_data-%s",
                    f"{job_complete_endpoint}/{self.request.job_id}",
                    self.request.auth_token,
                    self.request.telemetry_context,
                    data,
                )

    def _publish_local_data(self, item: ProcessStreamItem) -> None:


        #TODO: Report errors
        if isinstance(item, OutputFiles):
            for key, files in item.files.items():
                for index, file in enumerate(files):
                    file_id = upload_file(file)
                    files[index] = file_id




    def upload_file(self, file_path: str) -> Optional[str]:
        """Upload a local file path.

        Return a file_id or None if upload fails
        """
        if not os.path.exists(file_path):
            return None

        try:
            with open(file_path, 'rb') as file:
                file_name = os.path.basename(file_path)
                file_data = [('files', (file_name, file, 'application/octet-stream'))]
                response = self.rest.post_file(f"{self.api_url}/upload/store",
                                               file_data,
                                               self.request.auth_token,
                                               headers=self.request.telemetry_context)
                file_id = response['files'][0]['file_id'] if response else None
                return file_id
        finally:
            os.remove(file_path)

    def post_api(self, path: str, json_data: dict[Any, Any]):
        return self.rest.post(
            f"{self.api_url}{path}",
            json_data=json_data,
            token=self.request.auth_token,
            headers=self.request.telemetry_context)

class SlimPublisher(ResultPublisher):

    def __init__(myself, request: AutomationRequest, rest: RestAdapter, directory: str) -> None:
        myself.rest = rest
        myself.directory = directory
        myself.request = request

    def result(myself, item: ProcessStreamItem, complete: bool=False):
        item.process_guid = myself.request.process_guid
        item.correlation = myself.request.work_guid
        item.job_id = ""

        # Upload any references to local data
        myself._publish_local_data(item, ripple_config().api_base_uri)
        log.info(f"Job {'Result' if not complete else 'Complete'} -> {item}")