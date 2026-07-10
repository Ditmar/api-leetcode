# Use official Python 3.11 slim image
FROM python:3.11-slim

# Create a non-root user
RUN useradd -m -s /bin/bash executoruser

# Prepare workspace directory with correct ownership BEFORE switching user
RUN mkdir -p /workspace && chown executoruser:executoruser /workspace

# Switch to non-root user
USER executoruser

# Set working directory
WORKDIR /workspace

# Set default command
CMD ["python3"]