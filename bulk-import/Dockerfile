FROM alpine:3.19

LABEL maintainer="jacobrepp@gmail.com"
LABEL name="bulk-import"
LABEL description="Bulk import packages from perforce"
LABEL version="1.0.0"
LABEL tier="automation"


RUN apk add --no-cache wget ca-certificates libstdc++ libgcc bash libc6-compat git git-fast-import python3 vim && \
	wget -q -O /usr/bin/git-p4.py https://raw.githubusercontent.com/git/git/v2.38.1/git-p4.py && \
	wget -q -O /usr/bin/p4 https://cdist2.perforce.com/perforce/r22.1/bin.linux26x86_64/p4 && \
  sed -i 's#/usr/bin/env python#/usr/bin/env python3#' /usr/bin/git-p4.py && \
	chmod a+x /usr/bin/git-p4.py /usr/bin/p4

# Set up environment variables
ENV P4CONFIG=.p4config
ENV P4CHARSET=auto
ENV P4USER=mythica
ENV P4PASSWD=""
ENV P4PORT=ssl:p4.garden.mythica.ai:1666

# Create a non-root user
RUN adduser -D p4user
USER p4user
WORKDIR /home/p4user

CMD ["bash"]
