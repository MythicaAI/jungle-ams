FROM python:3.12-alpine
LABEL authors="jrepp"

# Build the requirements layer first, it shouldn't be changing very often
COPY requirements.txt .
RUN pip install -r requirements.txt

# Entrypoint to bootstrap the published content
COPY entrypoint.py .
ENTRYPOINT ["python3", "./entrypoint.py"]
