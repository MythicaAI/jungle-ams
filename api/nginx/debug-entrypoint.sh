docker run -it --rm -e CONF_FILE=nginx-debug.conf -p 8080:80 --network storage --add-host host.docker.internal:host-gateway mythica-web-front
