FROM debian:bookworm-slim AS build

LABEL name="mythica-gcs-proxy"
LABEL maintainer="jacobrepp@gmail.com"
LABEL verison="1.0.0"
LABEL tier="web"
LABEL description="Proxy for GCS static content" 

WORKDIR /tmp
ENV GCSPROXY_VERSION=0.4.2

RUN apt-get update \
    && apt-get install --no-install-suggests --no-install-recommends --yes ca-certificates wget \
    && wget https://github.com/daichirata/gcsproxy/releases/download/v${GCSPROXY_VERSION}/gcsproxy-${GCSPROXY_VERSION}-linux-amd64.tar.gz \
    && tar zxf gcsproxy-${GCSPROXY_VERSION}-linux-amd64.tar.gz \
    && cp ./gcsproxy-${GCSPROXY_VERSION}-linux-amd64/gcsproxy .

FROM gcr.io/distroless/base
COPY --from=build /tmp/gcsproxy /gcsproxy
ENTRYPOINT ["/gcsproxy"]
CMD [ "-b", "0.0.0.0:80" ]
