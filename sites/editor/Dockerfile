# Use the latest stable Node.js image
FROM node:lts-alpine AS build

LABEL name="mythica-editor-build"
LABEL maintainer="jacobrepp@gmail.com"
LABEL verison="1.0.0"
LABEL tier="web"
LABEL description="Build container for editor"

# Set the working directory
WORKDIR /dist/editor

# Copy code
COPY index.html ./
COPY assets ./
