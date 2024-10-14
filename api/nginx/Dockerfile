ARG TAG="latest"
FROM us-central1-docker.pkg.dev/controlnet-407314/gke-us-central1-images/mythica-sites-jungle3-build:${TAG} AS mythica_sites_jungle3_build

FROM nginx:1.25.5-alpine

LABEL name="mythica-web-front"
LABEL maintainer="jacobrepp@gmail.com"
LABEL verison="1.0.0"
LABEL tier="web"
LABEL description="NGINX front end configured for mythica services"

WORKDIR /sites

ENV API_ENDPOINT=app:5555
ENV DEX_ENDPOINT=dex:5556
ENV EXTERNAL_IP=127.0.0.1

# Copy the frontend build files from the frontend image
COPY --from=mythica_sites_jungle3_build /app/dist /sites/jungle3


COPY conf/variables.template /etc/nginx/templates/10-variables.conf.template
COPY conf/upstream.template /etc/nginx/templates/11-upstream.conf.template
COPY conf/*.conf /etc/nginx/
COPY conf/*.js /etc/nginx/
COPY ./docker-entrypoint.sh /

# override the base image, provide a different config for deployment environments
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-c", "/etc/nginx/nginx-local.conf"]
