FROM alpine:latest

LABEL name="lets-encrypt"
LABEL description="Runs the let's encrypt certificate process"
LABEL verison="1.0.0"
LABEL tier="web"
LABEL maintainer="jacob@mythica.ai"

# Install certbot
RUN apk add certbot kubectl

# Register the account in the image
RUN certbot register --email jacob@mythica.ai --agree-tos

WORKDIR /app
COPY certbot-certonly.sh .
COPY update-secrets.sh .

#
# for testing purposes, enable --testcert otherwise rate limiting
# may limit cert availability
#
# ENV EXTRA_ARGS="--testcert"

ENV DOMAINS="images.mythica.ai,api.mythica.ai"
ENV PATH="/app:${PATH}"

# Default command generates or renews a cert
CMD ["./certbot-certonly.sh"]
