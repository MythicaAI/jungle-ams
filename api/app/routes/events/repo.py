import logging

from ripple.models.params import ParameterSet

from db.schema.events import Event
from opentelemetry import trace
from ripple.automation.models import (
    AutomationResult,
    EventAutomationResponse,
)

log = logging.getLogger(__name__)

tracer = trace.get_tracer(__name__)


def update_or_create_event_automation(
    new_job_result_data: EventAutomationResponse, event: Event
) -> EventAutomationResponse:
    """Updates or creates new event automation data"""
    old_job_result_data = (
        EventAutomationResponse(**event.job_result_data)
        if event.job_result_data
        else None
    )

    def is_definition_incoming(item: AutomationResult):
        return hasattr(ParameterSet(**item.request.data), "hda_file")

    def is_cropped_incoming(item: AutomationResult):
        return hasattr(ParameterSet(**item.request.data), "image_file")

    is_bulk_processing = (
        new_job_result_data.is_bulk_processing
        if new_job_result_data.is_bulk_processing
        else False
    )

    if not old_job_result_data:
        old_job_result_data = new_job_result_data
    else:
        for new_item in new_job_result_data.request_result:
            # Find old item
            old_item = None
            index_of_old_item = None
            if is_definition_incoming(new_item) and new_item.processed is True:
                old_item = next(
                    (
                        item
                        for item in old_job_result_data.request_result
                        if item.result.job_def_id == new_item.result.job_def_id
                    ),
                    None,
                )
            elif is_cropped_incoming(new_item) and new_item.processed is True:
                old_item = next(
                    (
                        item
                        for item in old_job_result_data.request_result
                        if item.result.file_id == new_item.result.file_id
                    ),
                    None,
                )
            # Replace old item with new one
            if not old_item:
                old_job_result_data.request_result.append(new_item)
            else:
                index_of_old_item = old_job_result_data.request_result.index(old_item)
                old_job_result_data.request_result[index_of_old_item] = new_item
    event_processed = True
    is_there_job_definition = any(
        [is_definition_incoming(item) for item in old_job_result_data.request_result]
    )
    for item in old_job_result_data.request_result:
        if is_there_job_definition:
            # TODO: Currently only JobDefinition result fully affects on event processed status
            # or if there is no JobDefinition request
            if is_definition_incoming(item):
                if item.processed is False:
                    event_processed = False
                    break
        else:
            if is_cropped_incoming(item):
                if item.processed is False:
                    event_processed = False
                    break

    log.error(
        list(
            (item.processed is True, is_definition_incoming(item))
            for item in old_job_result_data.request_result
            # TODO: Currently only JobDefinition result affects on event processed status
        )
    )
    log.error(
        "Event automation updated. event_seq-%s, processed-%s, is_bulk_processing-%s, is_there_job_definition-%s",
        event.event_seq,
        event_processed,
        is_bulk_processing,
        is_there_job_definition,
    )
    if event_processed:
        old_job_result_data.processed = True
    else:
        old_job_result_data.processed = False
    old_job_result_data.is_bulk_processing = any(
        [is_bulk_processing, old_job_result_data.is_bulk_processing]
    )
    return old_job_result_data
