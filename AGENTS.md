# Agent Instructions and Project Requirements

This document outlines the standard requirements and best practices to be followed by the AI agent on all projects. The goal is to ensure consistency, quality, and production-readiness.

## 1. Containerization

- **All applications must be containerized.** Use Docker or Podman.
- A `Dockerfile` must be provided in the root of the repository.
- The Dockerfile should be optimized for production (e.g., using slim base images, multi-stage builds if necessary).

## 2. Deployment Setup

- **Provide `docker-compose.yml` for development.** This file should build the container from the local source code to facilitate easy development and testing.
- **Provide `docker-compose.prod.yml` for production.** This file must not build from source. It should pull the pre-built container image from a container registry.
- Use a reverse proxy (e.g., Caddy) in the compose files to handle concerns like HTTPS.

## 3. Continuous Integration & Deployment (CI/CD)

- **Set up a GitHub Actions workflow.**
- The workflow should be triggered on pushes to the `main` branch.
- The primary role of the workflow is to **build the container image and push it to the GitHub Container Registry (`ghcr.io`)**.
- The image should be tagged appropriately (e.g., `ghcr.io/OWNER/REPO:latest`).

## 4. HTTPS and Networking

- **All web-facing applications must use HTTPS.**
- HTTPS should be handled by a reverse proxy container (Caddy is preferred).
- The reverse proxy should be configured to automatically obtain and renew SSL certificates (e.g., from Let's Encrypt).
- The application container itself should not handle SSL termination. It should run on an unprivileged port (e.g., 8000) and be exposed only to the internal Docker/Podman network.

## 5. Documentation

- **A comprehensive `README.md` is mandatory.**
- The `README.md` must include clear, step-by-step instructions for:
    - **Development Setup:** How to run the application using the development `docker-compose.yml`.
    - **Production Deployment:** How to run the application using the production `docker-compose.prod.yml`. This must include instructions on how to specify the production image name.
    - **Platform-Specific Instructions:** Provide guidance for both **Docker** and **Podman**.
    - **Non-Privileged Users:** Include instructions on how to run the services as a non-privileged user, addressing issues with binding to privileged ports (e.g., using `setcap` for Docker or `sysctl` for Podman).
    - **Third-Party Service Integration:** If the application requires registration with external services (e.g., Telegram's `@BotFather`), these steps must be documented.
- Create an `.env.example` file to document all required environment variables.
- Ensure the `.gitignore` file is properly configured to exclude sensitive files like `.env` and local artifacts like `__pycache__` and database files.
