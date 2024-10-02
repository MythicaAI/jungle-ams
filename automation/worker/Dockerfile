# Minimal base image for storing worker files
FROM alpine:latest

LABEL maintainer="pedro@mythica.ai"
LABEL name="mythica-auto-worker"
LABEL description="Job Worker Stage for Mythica Job Services"
LABEL version="1.0.0"
LABEL tier="auto"

# Set working directory
WORKDIR /app

# Copy worker.py and requirements.txt into the volume container
COPY /automation/worker/worker.py /app/worker.py
COPY /automation/worker/requirements.txt /app/requirements_worker.txt
