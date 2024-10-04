import functions_framework
import uuid
import json
import asyncio
import nats
from nats.errors import ConnectionClosedError, TimeoutError, NoServersError

# Instantiates a client
import google.cloud.logging
client = google.cloud.logging.Client()

# Retrieves a Cloud Logging handler based on the environment
# you're running in and integrates the handler with the
# Python logging module. By default this captures all logs
# at INFO level and higher
client.setup_logging()

import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)

# NATS connection settings (set through environment variables or config)
NATS_SERVER = "nats://10.128.0.14:4222"
SUBMIT_SUBJECT = "genai"
STATUS_SUBJECT = "result"


# Synchronous wrapper for submitting work to NATS
async def nats_submit(request_data, work_id):
    return_data = None
    try:
        log.info("Starting NATS connection")
        nats_client = await nats.connect(servers=[NATS_SERVER])
        log.info("NATS connected")


        # Wait for the response with a timeout (customize as necessary)
        log.info("Setting up NATS response listener")
        response = await nats_client.subscribe(STATUS_SUBJECT)
        log.info("NATS response listener set up")

        # Prepare request with work_id
        req = {
            'work_id': work_id,
            'path': '/stabilityai/stable-diffusion-3-medium',
            'data': request_data
        }

        # Publish work request and wait for result
        log.info("Publishing request to NATS")
        await nats_client.publish(SUBMIT_SUBJECT, json.dumps(req).encode())
        log.info("Request published to NATS")
        
        try:
            async for msg in response.messages:
                payload = json.loads(msg.data.decode('utf-8'))
                log.info(f"Received Result in NATS {msg}")
                if payload['work_id'] == work_id:
                    log.info(f"Message matched origin. Processing")
                    data = payload['data']
                    if data['status'] == 'complete': 
                        await response.unsubscribe()
                        break
                    elif data['status']:
                        log.info(f"received status {data['status']}")
                    else:
                        return_data = data
                else:
                    log.info(f"Message ignored")
        except Exception as e:
            log.info(e)

    
    except ConnectionClosedError as e:
        log.info(e)
    except TimeoutError as e:
        log.info(e)
    except NoServersError as e:
        log.info(e)
    except Exception as e:
        log.info(e)
    finally:
        # Clean up NATS client
        if response is not None:
            await response.unsubscribe()
        if nats_client is not None:
            await nats_client.flush()
            await nats_client.close()

    return return_data

# Google Cloud Run function entry point
@functions_framework.http
def automation_request(request):
    work_id = str(uuid.uuid4())  # Generate unique work_id
    log.info(f"processing automation - work_id:{work_id}")
    
    # Get request data
    request_data = request.get_json(silent=True)
    log.info(f"request - {request_data}")
 
    # Synchronously submit work and get result
    result = asyncio.run(nats_submit(request_data, work_id))

    log.info(f"response - {result}")

    # Return the result
    return {"work_id": work_id, "result": result}
