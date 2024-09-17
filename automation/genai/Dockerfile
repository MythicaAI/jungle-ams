# Stage 1: worker file container
FROM mythica-auto-worker:latest as worker

# Use the specified CUDA base image
FROM nvcr.io/nvidia/cuda:12.6.0-base-ubuntu22.04
LABEL maintainer="pedro@mythica.ai"
LABEL name="mythica-genai-app"
LABEL description="API service for mythica gen ai rest services"
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
    software-properties-common pipx && \
    pipx ensurepath && \ 
    add-apt-repository ppa:deadsnakes/ppa && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    python3.11 python3.11-venv python3.11-dev python3-pip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV PATH="/root/.local/bin:$PATH"

RUN pipx install poetry

# Ensure pip is up-to-date
RUN python3.11 -m pip install --upgrade pip

# Set Python 3.11 as the default python version
RUN update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1


# Create the uploads folder
USER 0
RUN mkdir -p /uploads

WORKDIR /app


#########################
# GenAI


# Creates a non-root user and adds permission to access the /app folder
RUN adduser -u 5678 --disabled-password --gecos "" appuser && \
    chown -R appuser /app && \
    chown -R appuser /uploads

USER appuser
ENV PATH="/home/appuser/.local/bin:$PATH"


# Put all application data into the container /app directory, do this as late
# as possible to aid in the docker layer cache coherency

COPY ./pyproject.toml ./poetry.lock README.md /app/

# Run poetry as the app user to activate the virtual environment
RUN poetry check 
RUN poetry env use python3 
RUN poetry install

COPY . /app

#Set HuggingFace token before initialize and model download
ENV HF_TOKEN=${HF_AUTHTOKEN}

#This is an expensive project to test, unless you comment this out. 
#But leave it in for prod builds as it makes the container faster to load
RUN python3.11 ./worker.py initialize



# Overlay worker
COPY --from=worker /app/. /app
RUN pip install --no-cache-dir -r /app/requirements_worker.txt
