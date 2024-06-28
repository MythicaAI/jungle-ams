FROM python:3.12-alpine
LABEL authors="jrepp"

# Build the requirements layer first, it shouldn't be changing very often
# RUN pip install --upgrade pip google-cloud-storage

WORKDIR /app

COPY . .

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# Entrypoint to bootstrap the published content
ENTRYPOINT ["python3", "./packager.py"]
