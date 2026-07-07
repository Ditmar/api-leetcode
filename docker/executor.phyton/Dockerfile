# Use official Python 3.11 slim image to keep the size small
FROM python:3.11-slim

# Create a non-root user for security and resource isolation
RUN useradd -m -s /bin/bash executoruser
USER executoruser

# Set the working directory (assuming DockerRunner mounts tmpDir here)
WORKDIR /workspace

# Set default command (can be overridden by DockerRunner)
CMD ["python3"]