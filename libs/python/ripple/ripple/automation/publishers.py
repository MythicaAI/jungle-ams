import logging
from typing import Optional
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
        self._publish_local_data(item, self.api_url)

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
            log.debug(
                "ResultPublisher-nats-post: url-%s; token-%s; headers-%s; json_data-%s",
                f"{job_result_endpoint}/{self.request.job_id}",
                self.request.auth_token,
                self.request.telemetry_context,
                data,
            )
            if complete:
                self.rest.post(
                    f"{job_complete_endpoint}/{self.request.job_id}",
                    json_data={},
                    token=self.request.auth_token,
                    headers=self.request.telemetry_context,
                )
                log.debug(
                    "ResultPublisher-nats-post: url-%s; token-%s; headers-%s",
                    f"{job_complete_endpoint}/{self.request.job_id}",
                    self.request.auth_token,
                    self.request.telemetry_context,
                )

    def _publish_local_data(self, item: ProcessStreamItem, api_url: str) -> None:


        def upload_file(file_path: str) -> Optional[str]:
            if not os.path.exists(file_path):
                return None

            try:
                with open(file_path, 'rb') as file:
                    file_name = os.path.basename(file_path)
                    file_data = [('files', (file_name, file, 'application/octet-stream'))]
                    response = self.rest.post_file(f"{api_url}/upload/store",  file_data, self.request.auth_token,
                        headers=self.request.telemetry_context
                    )
                    file_id = response['files'][0]['file_id'] if response else None
                    return file_id
            finally:
                os.remove(file_path)

        def upload_job_def(job_def: JobDefinition) -> Optional[str]:
            definition = {
                'job_type': job_def.job_type,
                'name': job_def.name,
                'description': job_def.description,
                'params_schema': job_def.parameter_spec.model_dump(),
                'source': job_def.source.model_dump() if job_def.source else None,
            }
            response = self.rest.post(f"{api_url}/jobs/definitions", definition, self.request.auth_token,
                headers=self.request.telemetry_context
            )
            return response['job_def_id'] if response else None

        #TODO: Report errors
        if isinstance(item, OutputFiles):
            for key, files in item.files.items():
                for index, file in enumerate(files):
                    file_id = upload_file(file)
                    files[index] = file_id

        elif isinstance(item, JobDefinition):
            job_def_id = upload_job_def(item)
            if job_def_id is not None:
                item.job_def_id = job_def_id


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