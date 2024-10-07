ARG HOUDINI_VERSION=20.5.332

# Gather python dependencies - do the worker deps here too.
FROM python:3.11-slim AS python-dependency-downloader

# Copy monorepo dependencies
COPY /libs/python/cryptid /libs/python/cryptid
COPY /libs/python/ripple /libs/python/ripple

COPY /automation/houdini/requirements.txt /tmp/requirements.txt
RUN pip install --upgrade --no-cache-dir -r /tmp/requirements.txt

# Build the primary image
FROM aaronsmithtv/hbuild:${HOUDINI_VERSION}-base

# Install system dependencies
RUN apt-get update && apt-get install -y wget \
    && rm -rf /var/lib/apt/lists/*

# Setup Houdini environment
ARG SFX_CLIENT_ID
ARG SFX_CLIENT_SECRET

RUN echo "ClientID=${SFX_CLIENT_ID}" >  /root/houdini20.5/hserver.ini
RUN echo "ClientSecret=${SFX_CLIENT_SECRET}" >>  /root/houdini20.5/hserver.ini

RUN echo HOUDINI_ERRORLOG_LEVEL = 0 >> /root/houdini20.5/houdini.env
RUN echo HOUDINI_ERRORLOG_FILENAME = /output/log.txt >> /root/houdini20.5/houdini.env
RUN echo HOUDINI_OCL_DEVICETYPE = CPU >> /root/houdini20.5/houdini.env

RUN mkdir -p /root/houdini20.5/packages/

RUN mkdir /app
# Install Labs Plugins
ARG SIDE_FX_LABS_VERSION=20.5.332

RUN mkdir /app/sideFXLabs/
RUN wget https://github.com/sideeffects/SideFXLabs/archive/refs/tags/${SIDE_FX_LABS_VERSION}.tar.gz -O /tmp/sideFXLabs.tar.gz
RUN tar -xzf /tmp/sideFXLabs.tar.gz -C /app/sideFXLabs/ --strip-components=1
RUN rm /tmp/sideFXLabs.tar.gz

RUN cp /app/sideFXLabs/SideFXLabs.json /root/houdini20.5/packages/SideFXLabs.json
RUN sed -i 's|"$HOUDINI_PACKAGE_PATH/SideFXLabs20.5"|"/app/sideFXLabs"|g' /root/houdini20.5/packages/SideFXLabs.json

# Copy our code over
COPY /automation/houdini /app

# Install darol plugin 
COPY --from=python-dependency-downloader /usr/local/lib/python3.11/site-packages /darol/site-packages
RUN cp /app/darol-plugin/darol.json /root/houdini20.5/packages/darol.json
RUN sed -i 's|"/path/to/darol/repoclone/houdini-package"|"/app/darol-plugin"|g' /root/houdini20.5/packages/darol.json
RUN sed -i 's|"/path/to/python/Lib/site-packages"|"/darol/site-packages"|g' /root/houdini20.5/packages/darol.json


WORKDIR /app

ENTRYPOINT ["/bin/bash", "houdini.sh"]