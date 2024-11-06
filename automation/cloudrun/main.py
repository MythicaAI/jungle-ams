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
STATUS_SUBJECT = "result"


# Synchronous wrapper for submitting work to NATS
async def nats_submit(channel, path, data, work_id, profile_id):
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
            'path': path,
            'profile_id': profile_id,
            'data': data
        }

        # Publish work request and wait for result
        log.info("Publishing request to NATS")
        await nats_client.publish(channel, json.dumps(req).encode())
        log.info("Request published to NATS")
        
        try:
            async for msg in response.messages:
                data = json.loads(msg.data.decode('utf-8'))
                log.info(f"Received Result in NATS {msg}")
                if data['work_id'] == work_id:
                    log.info(f"Message matched origin. Processing")
                    datatype = 'result'
                    if 'item_type' in data['payload']:
                        datatype = data['payload']['item_type']
                        
                    if datatype != "progress":
                        return_data = data['payload']
                        break
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

    # Set CORS headers for the preflight request
    if request.method == "OPTIONS":
        # Allows GET requests from any origin with the Content-Type
        # header and caches preflight response for an 3600s
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
        }

        return ("", 204, headers)

    # Set CORS headers for the main request
    headers = {"Access-Control-Allow-Origin": "*"}

    # Get request data
    request_data = request.get_json(silent=True)
    log.info(f"request - {request_data}")

    work_id = request_data['work_id']
    if not work_id:
        work_id = str(uuid.uuid4())  # Generate unique work_id
    log.info(f"processing automation - work_id:{work_id}")

    channel = request_data['channel']
    path = request_data['path']
    data = request_data['data']
    profile_id = request_data['profile_id']
    
    if not channel:
            return {"work_id": work_id, "result": {"error":"channel not defined in request"}}
    # Synchronously submit work and get result
    result = asyncio.run(nats_submit(channel, path, data, work_id, profile_id))

    log.info(f"response - {result}")

    # Return the result
    return {"work_id": work_id, "result": result}
