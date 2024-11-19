ARG LIBS_PYTHON_IMAGE
FROM ${LIBS_PYTHON_IMAGE} AS libs-python-image

# Use the specified CUDA base image
FROM nvcr.io/nvidia/cuda:12.6.0-base-ubuntu22.04
LABEL maintainer="pedro@mythica.ai"
LABEL name="mythica-auto-blender"
LABEL description="Automation for mythica blender services"
LABEL version="1.0.0"
LABEL tier="auto"

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV PATH="/usr/local/bin:$PATH"

# Install Python 3.11 and dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        software-properties-common && \ 
    add-apt-repository ppa:deadsnakes/ppa && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        python3.11 python3.11-venv python3.11-dev python3-pip libx11-6 && \
    apt-get install -y \
        libopenexr-dev \ 
        bzip2 \ 
        build-essential \ 
        zlib1g-dev \ 
        libxmu-dev \ 
        libxi-dev \ 
        libxxf86vm-dev \ 
        libfontconfig1 \ 
        libxrender1 \ 
        libgl1-mesa-glx \ 
        libxkbcommon-x11-0 \
        xz-utils &&\
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

# Copy monorepo dependencies
COPY --from=libs-python-image /libs/python /libs/python

COPY requirements.txt /app/requirements.txt

# Set working directory
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY . /app
WORKDIR /app

#ENTRYPOINT ["python3.11", "workers.py"]
