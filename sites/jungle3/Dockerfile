# Use the latest stable Node.js image
FROM node:lts-alpine AS build

LABEL name="mythica-jungle3-build"
LABEL maintainer="jacobrepp@gmail.com"
LABEL verison="1.0.0"
LABEL tier="web"
LABEL description="Build container for jungle3"

# Set the working directory
WORKDIR /app

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
