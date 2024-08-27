ARG HOUDINI_VERSION=20.5.332

# Gather plugin python dependencies on the version that matches Houdini
FROM python:3.11-slim AS darol-dependency-downloader

COPY ./darol-plugin/requirements.txt /tmp/requirements.txt
RUN pip install --upgrade --no-cache-dir -r /tmp/requirements.txt

FROM python:3.11-slim AS nim-dependency-downloader

COPY ./nim-plugin/requirements.txt /tmp/requirements.txt
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

# Install darol plugin
COPY ./darol-plugin/ /darol-plugin/
COPY --from=darol-dependency-downloader /usr/local/lib/python3.11/site-packages /darol-plugin/site-packages

RUN cp /darol-plugin/darol.json /root/houdini20.5/packages/darol.json
RUN sed -i 's|"/path/to/darol/repoclone/houdini-package"|"/darol-plugin"|g' /root/houdini20.5/packages/darol.json
RUN sed -i 's|"/path/to/python/Lib/site-packages"|"/darol-plugin/site-packages"|g' /root/houdini20.5/packages/darol.json

# Install nim plugin
COPY ./nim-plugin/ /nim-plugin/
COPY --from=nim-dependency-downloader /usr/local/lib/python3.11/site-packages /nim-plugin/site-packages

RUN cp /nim-plugin/nim.json /root/houdini20.5/packages/nim.json
RUN sed -i 's|"/path/to/nim-plugin/repoclone/"|"/nim-plugin"|g' /root/houdini20.5/packages/nim.json
RUN sed -i 's|"\$NIM/.nim/lib/python3.11/site-packages"|"/nim-plugin/site-packages"|g' /root/houdini20.5/packages/nim.json

# Install Houdini SideFX Labs package
ARG SIDE_FX_LABS_VERSION=20.5.332

RUN mkdir /sideFXLabs/
RUN wget https://github.com/sideeffects/SideFXLabs/archive/refs/tags/${SIDE_FX_LABS_VERSION}.tar.gz -O /tmp/sideFXLabs.tar.gz
RUN tar -xzf /tmp/sideFXLabs.tar.gz -C /sideFXLabs/ --strip-components=1
RUN rm /tmp/sideFXLabs.tar.gz

RUN cp /sideFXLabs/SideFXLabs.json /root/houdini20.5/packages/SideFXLabs.json
RUN sed -i 's|"$HOUDINI_PACKAGE_PATH/SideFXLabs20.5"|"/sideFXLabs"|g' /root/houdini20.5/packages/SideFXLabs.json

# copy the runner over
WORKDIR /darol

COPY ./run.py /darol/run.py
COPY ./automation /darol/automation
COPY ./tests /darol/tests
