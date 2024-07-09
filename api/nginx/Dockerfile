#
# Create a builder to build the gcsfuse binary
# there is not yet an overlap of gcsfuse and nginx OS
# dependencies
#
FROM golang:1.22.3-alpine as builder

LABEL name="mythica-web-front"
LABEL maintainer="jacobrepp@gmail.com"
LABEL verison="1.0.0"
LABEL tier="web"
LABEL description="NGINX front end configured for mythica services"

RUN apk add git

WORKDIR /sites

#WORKDIR /repo
#RUN git clone --depth 1 --branch v2.0.1 https://github.com/GoogleCloudPlatform/gcsfuse.git
#WORKDIR /repo/gcsfuse
#RUN go install ./tools/build_gcsfuse
#RUN build_gcsfuse . /tmp $(git log -1 --format=format:"%H")

#
# Main image is the nginx alpine distribute
#
FROM nginx:1.25.5-alpine

# RUN apk add --update --no-cache bash ca-certificates fuse certbot

#COPY --from=builder /tmp/bin/gcsfuse /usr/local/bin/gcsfuse
#COPY --from=builder /tmp/sbin/mount.gcsfuse /usr/sbin/mount.gcsfuse

ENV API_ENDPOINT app:5555
ENV DEX_ENDPOINT dex:5556
ENV EXTERNAL_IP 127.0.0.1

COPY conf/variables.template /etc/nginx/templates/10-variables.conf.template
COPY conf/upstream.template /etc/nginx/templates/11-upstream.conf.template
COPY conf/*.conf /etc/nginx/
COPY ./docker-entrypoint.sh /

COPY fix_sites_privileges.sh /docker-entrypoint.d/100_fix_sites_privileges.sh

# override the base image, provide a different config for deployment environments
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-c", "/etc/nginx/nginx-local.conf"]
