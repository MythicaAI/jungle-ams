ARG VERSION=20.0.724-base

# Gather darol python dependencies on the version that matches Houdini
FROM python:3.10-slim AS python-dependency-downloader

RUN pip install --upgrade --no-cache-dir grpcio grpcio-tools msgpack

# Build the primary image
FROM kevincalderone/hbuild:${VERSION}

ARG SFX_CLIENT_ID
ARG SFX_CLIENT_SECRET

# Install system dependencies
RUN apt-get update && apt-get install -y wget \
    && rm -rf /var/lib/apt/lists/*

# Install OpenCL
RUN apt-get update && apt-get install -y pocl-opencl-icd \
    && rm -rf /var/lib/apt/lists/*

ENV HOUDINI_OCL_DEVICETYPE=CPU
ENV HOUDINI_USE_HFS_OCL=0

# Install python dependencies
COPY --from=python-dependency-downloader /usr/local/lib/python3.10/site-packages /darol/site-packages

# Clone the darol-plugin to the image
WORKDIR /darol

COPY ./darol-plugin/ /darol-plugin/

RUN mkdir -p /root/houdini20.0/packages/ && cp /darol-plugin/darol.json /root/houdini20.0/packages/darol.json
RUN sed -i 's|"/path/to/darol/repoclone/houdini-package"|"/darol-plugin"|g' /root/houdini20.0/packages/darol.json
RUN sed -i 's|"/path/to/python/Lib/site-packages"|"/darol/site-packages"|g' /root/houdini20.0/packages/darol.json

RUN echo "ClientID=${SFX_CLIENT_ID}" >  /root/houdini20.0/hserver.ini
RUN echo "ClientSecret=${SFX_CLIENT_SECRET}" >>  /root/houdini20.0/hserver.ini

RUN echo HOUDINI_ERRORLOG_LEVEL = 0 >> /root/houdini20.0/houdini.env
RUN echo HOUDINI_ERRORLOG_FILENAME = /output/log.txt >> /root/houdini20.0/houdini.env
RUN echo 'HOUDINI_OTLSCAN_PATH = @/otls;/darol/automation/otls;/darol/automation/otls/Flora/otls;/darol/automation/otls/Utilities/otls' >> /root/houdini20.0/houdini.env

# Install Houdini SideFX Labs package
ARG SIDE_FX_LABS_VERSION=688

RUN mkdir /sideFXLabs/
RUN wget https://github.com/sideeffects/SideFXLabs/archive/refs/tags/20.0.${SIDE_FX_LABS_VERSION}.tar.gz -O /tmp/sideFXLabs.tar.gz
RUN tar -xzf /tmp/sideFXLabs.tar.gz -C /sideFXLabs/ --strip-components=1
RUN rm /tmp/sideFXLabs.tar.gz

RUN cp /sideFXLabs/SideFXLabs.json /root/houdini20.0/packages/SideFXLabs.json
RUN sed -i 's|"$HOUDINI_PACKAGE_PATH/SideFXLabs20.0"|"/sideFXLabs"|g' /root/houdini20.0/packages/SideFXLabs.json

# copy the runner over. 
COPY ./run.py /darol/run.py
COPY ./automation /darol/automation
