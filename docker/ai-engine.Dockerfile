# Dockerfile representing the FIPS-compliant AI Threat Triage Engine
FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies for cryptography / networking checks
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libssl-dev \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Setup virtual environment and copy dependencies
COPY ./docker/requirements.ai-engine.txt ./requirements.txt 2>/dev/null || :
# Fallback to creating dependencies inline if file not present yet
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir \
       requests>=2.31.0 \
       urllib3>=2.0.0 \
       cryptography>=41.0.0 \
       google-genai>=0.1.0

# Copy implementation scripts (e.g. background event analyzers)
COPY . .

# Run as non-privileged service operator for security isolation
RUN groupadd -g 10001 triage-mgr && useradd -u 10001 -g triage-mgr triage-mgr \
    && chown -R triage-mgr:triage-mgr /app
USER triage-mgr

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/health', timeout=5)" || exit 1

EXPOSE 8080

CMD ["python3", "-m", "http.server", "8080"]
