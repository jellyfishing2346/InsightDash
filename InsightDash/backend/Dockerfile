# Backend Dockerfile for Mock Server
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install only required dependencies for mock server
RUN pip install --no-cache-dir numpy

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the mock server
CMD ["python3", "mock_server.py"]
