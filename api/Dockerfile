FROM nginx:1.26

# Add GCS fuse support
RUN . /etc/os-release && \
      echo "deb [signed-by=/usr/share/keyrings/cloud.google.asc] https://packages.cloud.google.com/apt $VERSION_CODENAME main" | \
      tee /etc/apt/sources.list.d/gcsfuse.list

# Import the cloud GPG key
RUN curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | \
    tee /usr/share/keyrings/cloud.google.asc

RUN cat /etc/apt/sources.list.d/gcsfuse.list

# Update the package index
# Install GCS fuse and certbot
RUN apt update -y && \
    apt install -y gcsfuse certbot && \
    apt clean && \
    rm -rf /var/lib/apt/lists/*

ENV API_ENDPOINT localhost:5555
ENV DEX_ENDPOINT localhost:5556

COPY conf/variables.template /etc/nginx/templates/10-variables.conf.template
COPY conf/upstream.template /etc/nginx/templates/11-upstream.conf.template
COPY conf/nginx.conf /etc/nginx/
COPY content /www/html
