# Use the latest stable Node.js image
FROM node:lts-alpine AS build

LABEL name="mythica-awful-ui-build"
LABEL maintainer="pedro@mythica.ai"
LABEL verison="1.0.0"
LABEL tier="web"
LABEL description="Build container for awful-ui"

# Set the working directory
WORKDIR /build

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml (if available)
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy code
COPY . .

# Build the application
ARG NODE_ENV=production

# Specify the output directory is /app/dist
RUN pnpm run build -m "${NODE_ENV}"


# Copy build artifacts from the builder stage to a dist folder
# structure, to support mounting multiple site builds give each dist
# folder the name of the mounted site
FROM alpine:latest

# Install envsubst for runtime environment substitution
RUN apk add gettext


WORKDIR /dist/awful-ui
COPY docker-entrypoint.sh .
COPY --from=build /build/dist .
RUN mv index.html index.html.template
ENTRYPOINT ["/dist/awful-ui/docker-entrypoint.sh"]
