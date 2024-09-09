# Use the specified CUDA base image
FROM nvcr.io/nvidia/cuda:12.6.0-base-ubuntu22.04
LABEL maintainer="pedro@mythica.ai"
LABEL name="mythica-genai-app"
LABEL description="API service for mythica gen ai rest services"
LABEL version="1.0.0"
LABEL tier="web"

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


# Create the uploads folder
USER 0
RUN mkdir -p /uploads

WORKDIR /app

# Run all dependent installs before application code layer
RUN pip install --upgrade pip poetry 

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
#But leave it in for prod builds as it makes hte container faster to load
RUN ./docker-entrypoint-webapi.sh initialize

# Application server listen port, see ./docker-entrypoint.sh
EXPOSE 5556

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# Env config and defaults
ENV HTTP_LISTEN_ADDR 0.0.0.0
ENV HTTP_LISTEN_PORT 5556
ENV WORKER_COUNT 1


CMD ["sh", "./docker-entrypoint.sh"]
