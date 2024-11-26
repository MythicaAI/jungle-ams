FROM alpine:latest

LABEL name="lets-encrypt"
LABEL description="Runs the let's encrypt certificate process"
LABEL verison="1.0.0"
LABEL tier="web"
LABEL maintainer="jacob@mythica.ai"

# Install certbot
RUN apk add --no-cache certbot kubectl nginx openssl supervisor

# Register the account in the image
RUN certbot register --email jacob@mythica.ai --agree-tos

ENV CHALLENGE_ROOT="/var/www/certbot"
WORKDIR /app

RUN mkdir -p ${CHALLENGE_ROOT}
RUN mkdir -p /var/www/html


RUN chown -R nginx:nginx /var/www/html /var/www/certbot

COPY certbot-certonly.sh .
COPY certbot-renew.sh .
COPY update-secrets.sh .
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create a file for testing round trip availability
RUN mkdir -p /var/www/certbot/.well-known/acme-challenge/
RUN echo pong > /var/www/certbot/.well-known/acme-challenge/ping.txt

# Listen on port 80 for challenges
EXPOSE 80

#
# for testing purposes, enable --testcert otherwise rate limiting
# may limit cert availability
#
# ENV EXTRA_ARGS="--testcert"

# location to attempt to install the generated cert
ENV TLS_NAMESPACE=ingress
ENV TLS_NAME="mythica-lets-encrypt-tls"

ENV DOMAINS="oss.mythica.ai,api.mythica.ai,dex.mythica.ai"
ENV PATH="/app:${PATH}"


# Use supervisord to manage container process orchestration
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
