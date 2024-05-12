# Use the official Python base image
FROM python:3.12

# Set the working directory
WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Python service code
COPY service.py .

# Install RabbitMQ
RUN apt-get update && apt-get install -y rabbitmq-server

# Enable the RabbitMQ management plugin
RUN rabbitmq-plugins enable rabbitmq_management

# Define the RabbitMQ broker configuration
ENV RABBITMQ_NODE_PORT=5672 \
    RABBITMQ_NODENAME=rabbit1 \
    RABBITMQ_ERLANG_COOKIE=secret_cookie \
    RABBITMQ_CLUSTER_NODES=rabbit1@localhost,rabbit2@localhost \
    RABBITMQ_CONFIG_FILE=/etc/rabbitmq/rabbitmq.config

# Copy the RabbitMQ configuration file
COPY rabbitmq.config /etc/rabbitmq/rabbitmq.config

# Expose the necessary ports
EXPOSE 5672 15672

# Run the RabbitMQ server and the Python service
CMD ["sh", "-c", "rabbitmq-server -detached && python service.py"]
