# Use the latest stable Node.js image
FROM node:lts-alpine AS build

LABEL name="mythica-sites-build"
LABEL maintainer="pedro@mythica.ai"
LABEL verison="1.0.0"
LABEL tier="web"
LABEL description="Build container for websites"

# Set the working directory
WORKDIR /build

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml (if available)
COPY . ./

# Install dependencies
RUN pnpm install

# Build the application
ARG NODE_ENV=production

# Build houdini-ui first since other packages may depend on it
WORKDIR /build/libs/houdini-ui
RUN pnpm run build -m "${NODE_ENV}"


# Build the remaining projects
WORKDIR /build/awful-ui
RUN pnpm run build -m "${NODE_ENV}"
WORKDIR /build/jungle3
RUN pnpm run build -m "${NODE_ENV}"





# Copy build artifacts from the builder stage to a dist folder
# structure, to support mounting multiple site builds give each dist
# folder the name of the mounted site
FROM alpine:latest
# Install envsubst for runtime environment substitution
RUN apk add gettext

WORKDIR /dist
COPY docker-entrypoint.sh .

WORKDIR /dist/jungle3
COPY --from=build /build/jungle3/dist .
RUN mv index.html index.html.template
WORKDIR /dist/awful-ui
COPY --from=build /build/awful-ui/dist .
RUN mv index.html index.html.template

WORKDIR /dist
ENTRYPOINT ["/dist/docker-entrypoint.sh"]
