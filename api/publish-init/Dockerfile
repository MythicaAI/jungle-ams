FROM python:3.12-alpine
LABEL authors="jrepp"

# Build the requirements layer first, it shouldn't be changing very often
COPY Pipfile .
COPY Pipfile.lock .
RUN pip install --upgrade pip && pip install pipenv
RUN pipenv install --dev --system --deploy

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1


# Entrypoint to bootstrap the published content
COPY entrypoint.py .
ENTRYPOINT ["python3", "./entrypoint.py"]
