FROM python:3.12-alpine

LABEL name="publish-init"
LABEL description="Initializes files from the publishing cache bucket"
LABEL verison="1.0.0"
LABEL tier="web"
LABEL maintainer="jacobrepp@gmail.com"

# Build the requirements layer first, it shouldn't be changing very often
RUN pip install --upgrade pip google-cloud-storage

WORKDIR /app

COPY . .

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# Entrypoint to bootstrap the published content
ENTRYPOINT ["python3", "./entrypoint.py"]
