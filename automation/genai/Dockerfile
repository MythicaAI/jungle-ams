# Stage 1: worker file container
FROM mythica-auto-worker:latest as worker

# Use the specified CUDA base image
FROM nvcr.io/nvidia/cuda:12.6.0-base-ubuntu22.04
LABEL maintainer="pedro@mythica.ai"
LABEL name="mythica-auto-genai"
LABEL description="Automation for mythica gen aiservices"
LABEL version="1.0.0"
LABEL tier="auto"

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV PATH="/usr/local/bin:$PATH"

# Setup HuggingFace API KEY
ARG HF_AUTHTOKEN

# Install Python 3.11 and dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    software-properties-common && \ 
    add-apt-repository ppa:deadsnakes/ppa && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    python3.11 python3.11-venv python3.11-dev python3-pip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Ensure pip is up-to-date
RUN python3.11 -m pip install --upgrade pip

# Set Python 3.11 as the default python version
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1

RUN mkdir /app

# Creates a non-root user and adds permission to access the /app folder
RUN adduser -u 5678 --disabled-password --gecos "" appuser && \
    chown -R appuser /app 

USER appuser
ENV PATH="/home/appuser/.local/bin:$PATH"



COPY ./requirements.txt /app/requirements.txt

# Set working directory
RUN pip install --no-cache-dir -r /app/requirements.txt

#Set HuggingFace token before initialize and model download
ENV HF_TOKEN=${HF_AUTHTOKEN}

# Overlay worker
COPY --from=worker /app/requirements_worker.txt /app/requirements_worker.txt
RUN pip install --no-cache-dir -r /app/requirements_worker.txt

COPY --from=worker /app/worker.py /app/worker.py

COPY . /app
WORKDIR /app

#This is an expensive project to test, unless you comment this out. 
#But leave it in for prod builds as it makes the container faster to load
RUN python3.11 worker.py initialize

