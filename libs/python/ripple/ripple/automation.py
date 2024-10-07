import json
import os
import aiohttp
import logging
import asyncio
import nats
from pydantic import BaseModel
from typing import Callable, Type, Optional, Dict

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)

NATS_URL= 'nats://nats.nats:4222'
API_URL= 'https://api.mythica.ai/v1'


class AsyncAdapter():
    def schedule_task(self, task_def):
        """Houdini has an event loop already running so we need to work around it"""
        try:
            loop =asyncio.get_event_loop()
            if loop.is_running():
                loop.create_task(task_def())
            else:
                loop.run_until_complete(task_def())
        except RuntimeError:
            asyncio.run(task_def())
    
    def post(self, subject: str, data: dict) -> None:
        pass

class NatsAdapter(AsyncAdapter):
    def __init__(self, nats_url=NATS_URL) -> None:
        self.nats_url = nats_url
        self.listeners = {}
        self.nc = None  # Single NATS client connection

    async def _connect(self):
        """Establish a connection to NATS."""
        if not self.nc:
            log.debug("Connecting to NATS")
            self.nc = await nats.connect(servers=[self.nats_url])
            log.debug("Connected to NATS")


    async def _disconnect(self):
        """Disconnect from NATS gracefully."""
        if self.nc:
            log.debug("Disconnecting from NATS")
            await self.nc.drain()  # Gracefully stop receiving messages
            self.nc = None
            log.debug("Disconnected from NATS")

    def post(self, subject: str, data: dict) -> None:
        """Post data to NATS on subject. """
        async def _post_async() -> None:
            """Post data to NATS on subject. """
            await self._connect()                
            try:
                log.debug(f"Sending to NATS: {subject} - {data}" )
                await self.nc.publish(subject, json.dumps(data).encode())
                log.debug(f"Sent to NATS")
            except Exception as e:
                log.error(f"Sending to NATS failed: {subject} - {data} - {e}")
            finally:
                if not self.listeners:
                    await self._disconnect()

        self.schedule_task(_post_async)

    # Synchronous wrapper for submitting work to NATS
    def listen(self, subject: str, callback: callable):
    
        async def _listen_async() -> None:
            await self._connect()

            if subject in self.listeners:
                log.warning(f"NATS listener already active for subject {subject}")
                return

            async def message_handler(msg):
                try:
                    payload = json.loads(msg.data.decode('utf-8'))
                    log.info(f"Received message on {subject}: {payload}")
                    await callback(payload)
                except Exception as e:
                    log.error(f"Error processing message on {subject}: {e}")

            try:
            
                # Wait for the response with a timeout (customize as necessary)
                log.info("Setting up NATS response listener")
                listener = await self.nc.subscribe(subject, message_handler)
                self.listeners[subject] = listener
                log.info("NATS response listener set up")

            except Exception as e:
                log.error(f"Error setting up listener for subject {subject}: {e}")
                raise e
        self.schedule_task(_listen_async)

    def unlisten(self, subject: str):
        async def _unlisten_async()-> None:

            """Shut down the listener for a specific subject."""
            if subject in self.listeners:
                log.info(f"Shutting down listener for subject {subject}")
                subscription = self.listeners.pop(subject)
                await subscription.unsubscribe()
                log.info(f"Listener for subject {subject} shut down")
                if not self.listeners:
                    await self._disconnect
                    log.info(f"Last Listener was shut down. Closing Connection")
            else:
                log.warning(f"No active listener found for subject {subject}")
        self.schedule_task(_unlisten_async)


class RestAdapter(AsyncAdapter):
    def __init__(self, api_url=API_URL) -> None:
        self.api_url = api_url

    
    def post(self, endpoint: str, data: dict=None) -> None:
        """Post data to an endpoint. """
        endpoint = os.path.join(API_URL,endpoint)
        async def _post_async() -> None:
            async with aiohttp.ClientSession() as session:
                log.debug(f"Sending to Endpoint: {endpoint} - {data}" )
                async with session.post(
                            endpoint, 
                            json=json.dumps(data), 
                            headers={"Content-Type": "application/json"}) as post_result:
                    if post_result.status in [200,201]:
                        log.debug(f"Endpoint Response: {post_result.status}")
                    else:
                        log.error(f"Failed to call job API: {endpoint} - {data} - {post_result.status}")

        self.schedule_task(_post_async)


class WorkerModel(BaseModel):
    path: str
    provider: Callable
    inputModel: Type[BaseModel]

class WorkerRequest(BaseModel):
    """Contract for requests for work"""
    work_id: str
    job_id: Optional[str] = None  # job_id is optional
    path: str
    data: Dict

class WorkerResponse(WorkerRequest):
    """Contract for responses to work requess"""
    result_data: Dict   


class Worker:
    def __init__(self) -> None:
        self.workers:dict[str,WorkerModel] = {}
        self.nats = NatsAdapter()
        self.rest = RestAdapter()

    def start(self,subject: str, workers:list[dict]) -> None:
        self._load_workers(workers)
        self.nats.listen(subject, self._do_work)

    def _load_workers(self,workers):
        """Function to dynamically discover and register workers in a container"""
        try:
            log.debug(f'Start Registering workers')
            for worker in workers:
                model = WorkerModel(**worker)
                self.workers[model.path] = model
                log.debug(f"Registered worker for '{model.path}'")
            log.debug(f'End Registering workers')
        except Exception as e:
            log.error(f'Failed to register workers: {e}')
 



    #Callback for reporting back. 
    def _result(self,rdata: dict, complete=False):
        JOB_RESULT_ENDPOINT="/jobs/results/"
        JOB_COMPLETE_ENDPOINT="/jobs/complete/"

        log.info(f"Job {'Result' if not complete else 'Complete'} -> {rdata}")

        #TODO: We need to unresolve file params in the result_data field and externalize the "result" channel
        self.nats.post("result", rdata) 
        
        if rdata.job_id:
            if complete:
                self.rest.post(f"{JOB_COMPLETE_ENDPOINT}/{rdata.job_id}")
            else:
                self.rest.post(f"{JOB_RESULT_ENDPOINT}/{rdata.job_id}", rdata)
            


    def _do_work(self, json_payload: str):
        """
        Execute a work unit by trying to find a route that maps
        to the path defined in the payload. If a route is defined,
        data is sent to the route provider, along with a callback for 
        reporting status
        """

        #Parse the json_payload
        try:
            parsed_payload = json.loads(json_payload)

            #TODO: We need to resolve file params in the payload.data field
            payload = WorkerRequest(**parsed_payload)

            log_str = f"work_id:{payload.work_id}, work:{payload.path}, job_id: {payload.job_id}, data: {payload.data}"

            #TODO: These should be defined elsewhere.

        except Exception as e:
            msg=f'Error parsing payload - {json_payload} - {str(e)}'
            self.nats.post("result", {'status': msg })
            #Cannot report to endpoint as message could not be parsed
            log.error(f"Validation error: {msg}")
            return 
            


        #Run the worker
        try:
            self._result({'status': 'started'})

            worker = self.workers[payload.path] 
            inputs = worker.inputModel(**payload.data)
            worker.provider(inputs, self._result)

            self._result({'status': 'complete'}, complete=True)

        except Exception as e:
            log.error(f"Executor error - {log_str} - {e}")
            self._result({
                'status': 'error',
                'message': str(e)
            })
            



