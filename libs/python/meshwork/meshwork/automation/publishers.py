import asyncio
import base64
import logging
import os

from meshwork.auth.generate_token import decode_token
from meshwork.automation.adapters import NatsAdapter, RestAdapter
from meshwork.automation.models import AutomationRequest
from meshwork.automation.utils import error_handler
from meshwork.config import meshwork_config, update_headers_from_context
from meshwork.models.streaming import (
    CropImageResponse,
    FileContentChunk,
    JobDefinition,
    OutputFiles,
    ProcessStreamItem,
)

NATS_FILE_CHUNK_SIZE = 64 * 1024

logging.basicConfig(
    level=logging.DEBUG, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
log = logging.getLogger(__name__)


class ResultPublisher:
    """ "
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
        directory: str,
    ) -> None:
        self.request = request
        self.directory = directory
        self.profile = decode_token(request.auth_token)
        self.nats = nats_adapter
        self.rest = rest
        self.api_url = meshwork_config().api_base_uri

    # Callback for reporting back.
    def result(self, item: ProcessStreamItem, complete: bool = False):
        item.process_guid = self.request.process_guid
        item.correlation = self.request.correlation
        item.job_id = self.request.job_id or ""

        # Upload any references to local data
        self._publish_local_data(item, self.api_url)

        job_result_endpoint = f"{self.api_url}/jobs/results"
        job_complete_endpoint = f"{self.api_url}/jobs/complete"

        # Publish results
        log.info(f"Automation {'Result' if not complete else 'Complete'} -> {item}")

        if self.request.results_subject:
            task = asyncio.create_task(
                self.nats.post_to(
                    "result", self.request.results_subject, item.model_dump()
                )
            )
            task.add_done_callback(error_handler(log))

        if self.request.job_id:
            updated_headers = update_headers_from_context()
            data = {"created_in": "automation-worker", "result_data": item.model_dump()}
            self.rest.post(
                f"{job_result_endpoint}/{self.request.job_id}",
                json_data=data,
                token=self.request.auth_token,
                headers=updated_headers,
            )
            log.debug(
                "ResultPublisher-nats-post: url-%s; token-%s; headers-%s; json_data-%s",
                f"{job_result_endpoint}/{self.request.job_id}",
                self.request.auth_token,
                updated_headers,
                data,
            )
            if complete:
                self.rest.post(
                    f"{job_complete_endpoint}/{self.request.job_id}",
                    json_data={},
                    token=self.request.auth_token,
                    headers=updated_headers,
                )
                log.debug(
                    "ResultPublisher-nats-post: url-%s; token-%s; headers-%s",
                    f"{job_complete_endpoint}/{self.request.job_id}",
                    self.request.auth_token,
                    updated_headers,
                )

    def _publish_local_data(self, item: ProcessStreamItem, api_url: str) -> None:
        updated_headers = update_headers_from_context()

        def upload_file(file_path: str, key: str, index: int) -> tuple[str | None]:
            if not os.path.exists(file_path):
                log.error("File not found: %s", file_path)
                return (None, None)

            try:
                # if self.request.results_subject:
                #   self._stream_file_chunks(file_path, key, index)

                with open(file_path, "rb") as file:
                    file_name = os.path.basename(file_path)
                    file_data = [
                        ("files", (file_name, file, "application/octet-stream"))
                    ]
                    response = self.rest.post_file(
                        f"{api_url}/upload/store",
                        file_data,
                        self.request.auth_token,
                        headers=updated_headers,
                    )
                    file_id, file_name = (
                        (
                            response["files"][0].get("file_id"),
                            response["files"][0].get("file_name"),
                        )
                        if response
                        else (None, None)
                    )
                    log.info("Uploaded response: %s", response)
                    return file_id, file_name
            finally:
                os.remove(file_path)

        def upload_job_def(job_def: JobDefinition) -> str | None:
            definition = {
                "job_type": job_def.job_type,
                "name": job_def.name,
                "description": job_def.description,
                "params_schema": job_def.parameter_spec.model_dump(),
                "source": job_def.source.model_dump() if job_def.source else None,
            }
            response = self.rest.post(
                f"{api_url}/jobs/definitions",
                definition,
                self.request.auth_token,
                headers=updated_headers,
            )
            return response["job_def_id"] if response else None

        def add_cropped_image_to_contents(item: CropImageResponse) -> bool:
            """
            Add the cropped image to the contents of the source asset.
            """
            cropped_req = {
                "file_id": item.file_id,
                "file_name": item.file_name,
                "src_file_id": item.src_file_id,
                "file_type": "thumbnails",
            }
            response = self.rest.post(
                f"{api_url}/assets/{item.src_asset_id}/versions/{item.src_version}/contents",
                cropped_req,
                self.request.auth_token,
                headers=updated_headers,
            )
            return True if response else False

        # TODO: Report errors
        if isinstance(item, OutputFiles):
            for key, files in item.files.items():
                for index, file in enumerate(files):
                    file_id, _ = upload_file(file, key, index)
                    files[index] = file_id

        elif isinstance(item, JobDefinition):
            job_def_id = upload_job_def(item)
            if job_def_id is not None:
                item.job_def_id = job_def_id

        elif isinstance(item, CropImageResponse):
            file_id, file_name = upload_file(item.file_path, "cropped_image", 0)
            if file_id is not None and file_name is not None:
                item.file_id = file_id
                item.file_name = file_name
                processed = add_cropped_image_to_contents(item)
                if processed:
                    log.info("Added cropped image to contents, item: %s", item)
                    return
            log.error("Failed to add cropped image to contents, item: %s", item)

    def _stream_file_chunks(self, file_path: str, key: str, index: int) -> None:
        """Stream a file's contents as base64-encoded chunks via NATS"""
        with open(file_path, "rb") as file:
            file_size = os.path.getsize(file_path)
            total_chunks = (
                file_size + NATS_FILE_CHUNK_SIZE - 1
            ) // NATS_FILE_CHUNK_SIZE
            chunk_index = 0

            while chunk := file.read(NATS_FILE_CHUNK_SIZE):
                encoded_data = base64.b64encode(chunk).decode("utf-8")
                chunk_item = FileContentChunk(
                    process_guid=self.request.process_guid,
                    correlation=self.request.correlation,
                    job_id=self.request.job_id or "",
                    file_key=key,
                    file_index=index,
                    chunk_index=chunk_index,
                    total_chunks=total_chunks,
                    file_size=file_size,
                    encoded_data=encoded_data,
                )

                task = asyncio.create_task(
                    self.nats.post_to(
                        "result", self.request.results_subject, chunk_item.model_dump()
                    )
                )
                task.add_done_callback(error_handler(log))
                chunk_index += 1

            assert chunk_index == total_chunks


class SlimPublisher(ResultPublisher):
    def __init__(
        myself, request: AutomationRequest, rest: RestAdapter, directory: str
    ) -> None:
        myself.rest = rest
        myself.directory = directory
        myself.request = request

    def result(myself, item: ProcessStreamItem, complete: bool = False):
        item.process_guid = myself.request.process_guid
        item.correlation = myself.request.correlation
        item.job_id = ""

        # Upload any references to local data
        myself._publish_local_data(item, meshwork_config().api_base_uri)
        log.info(f"Job {'Result' if not complete else 'Complete'} -> {item}")
