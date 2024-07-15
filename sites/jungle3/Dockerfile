# Use the latest stable Node.js image
FROM node:lts-alpine

# Set the working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml (if available)
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy the rest of your application's code
COPY . .

# Build the application
RUN pnpm run build

# Expose the port your app runs on (adjust if necessary)
EXPOSE 5555

ENTRYPOINT ["pnpm", "run"]

# Command to run the application
CMD ["build-dev"]
