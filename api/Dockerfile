#
# Create a builder to build the gcsfuse binary
# there is not yet an overlap of gcsfuse and nginx OS
# dependencies
#
FROM golang:1.22.3-alpine as builder

RUN apk add git

WORKDIR /repo
RUN git clone --depth 1 --branch v2.0.1 https://github.com/GoogleCloudPlatform/gcsfuse.git
WORKDIR /repo/gcsfuse
RUN go install ./tools/build_gcsfuse
RUN build_gcsfuse . /tmp $(git log -1 --format=format:"%H")

#
# Main image is the nginx alpine distribute
#
FROM nginx:1.25.5-alpine

RUN apk add --update --no-cache bash ca-certificates fuse certbot

COPY --from=builder /tmp/bin/gcsfuse /usr/local/bin/gcsfuse
COPY --from=builder /tmp/sbin/mount.gcsfuse /usr/sbin/mount.gcsfuse

ENV API_ENDPOINT localhost:5555
ENV DEX_ENDPOINT localhost:5556

COPY conf/variables.template /etc/nginx/templates/10-variables.conf.template
COPY conf/upstream.template /etc/nginx/templates/11-upstream.conf.template
COPY conf/nginx.conf /etc/nginx/
COPY content /www/html
