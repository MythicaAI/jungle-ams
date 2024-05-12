FROM nginx:latest

ENV API_ENDPOINT localhost:5555
ENV DEX_ENDPOINT localhost:5556

COPY conf/variables.template /etc/nginx/templates/10-variables.conf.template
COPY conf/upstream.template /etc/nginx/templates/11-upstream.conf.template
COPY conf/nginx.conf /etc/nginx/
COPY content /www/html
