# Class Coordinating App for Telegram

This is a Telegram Mini App for coordinating classes. It allows users to create classes, RSVP, and ask questions.

## How to Run the App

This application is designed to be run with Docker and Docker Compose. For production, it's recommended to use a reverse proxy to handle HTTPS, as Telegram Mini Apps require a secure connection.

### Recommended Setup with Caddy (for automatic HTTPS)

This setup is ideal for development. We provide a `docker-compose.yml` file that includes the application and a Caddy server. Caddy will automatically obtain and renew SSL certificates from Let's Encrypt for your domain.

### Production Deployment

For production, it is recommended to use the `docker-compose.prod.yml` file. This file uses the pre-built Docker image from the GitHub Container Registry, so you don't need the source code on your server.

**Run the application:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```
Or with Podman:
```bash
podman-compose -f docker-compose.prod.yml up -d
```
This will pull the `ghcr.io/korjavin/tgwebapp:latest` image and run it.

**Prerequisites:**
- A server with Docker and Docker Compose installed.
- A domain name pointing to your server's IP address (e.g., `t1.kfamcloud.com`).

**A Note on Running as a Non-Privileged User:**

By default, binding to ports below 1024 (like 80 and 443) requires root privileges. If you are running Docker as a non-root user (which is a good security practice), you may get a "permission denied" error when trying to run `docker-compose up`.

To solve this, you can grant the Docker binaries the capability to bind to privileged ports without needing to be run as root. This is a secure and standard way to handle this issue.

Run the following commands on your server:
```bash
sudo setcap cap_net_bind_service=+ep $(which dockerd)
sudo setcap cap_net_bind_service=+ep $(which docker-proxy)
```
After running these commands, you should be able to start the services with `docker-compose up` as a non-privileged user.

**Steps:**
1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Configure `docker-compose.yml`:**
    Open the `docker-compose.yml` file and change the `CADDY_DOMAIN` environment variable to your domain name.

3.  **Run the application:**
    ```bash
    docker-compose up -d
    ```
    This will start the application and the Caddy reverse proxy in the background. Caddy will automatically handle the SSL certificate for your domain.

4.  **Check the logs:**
    You can check the logs to make sure everything is running correctly:
    ```bash
    docker-compose logs -f
    ```

### Building and Running Manually

If you prefer to run the application without Docker Compose, you can build and run the Docker image manually. You will need to have a reverse proxy set up separately to handle HTTPS.

1.  **Build the Docker image:**
    ```bash
    docker build -t class-coordinator-app .
    ```

2.  **Run the Docker container:**
    ```bash
    docker run -d -p 8000:8000 --name class-coordinator-app class-coordinator-app
    ```
    This will run the application on port 8000. You will need to configure your reverse proxy to forward requests to this port.

### Running with Podman

If you are using Podman instead of Docker, the setup is very similar.

## Deploying to Render

This repository is configured for automatic deployment to [Render](https://render.com/) via a `render.yaml` file.

When you create a new "Blueprint" service on Render and connect it to this repository, Render will automatically:
1.  Build the `Dockerfile`.
2.  Deploy the application.
3.  Attach the `t1.kfamcloud.com` domain and provide a free SSL certificate.

You will need to add your custom domain `t1.kfamcloud.com` to your Render project settings and configure your DNS records as per Render's instructions.

**Prerequisites:**
- Podman and `podman-compose` installed on your server.
- A domain name pointing to your server's IP address.

**Steps:**
1.  **Install `podman-compose`:**
    If you don't have it already, install `podman-compose`. It's often available in your distribution's package manager. For example:
    ```bash
    sudo apt-get install podman-compose
    # or
    sudo dnf install podman-compose
    ```

2.  **Allow Binding to Privileged Ports:**
    By default, rootless Podman containers cannot bind to ports below 1024. To allow this for the Caddy container, you need to adjust a system setting.
    Run the following command on your server:
    ```bash
    sudo sysctl net.ipv4.ip_unprivileged_port_start=0
    ```
    To make this change permanent across reboots, create a new file `/etc/sysctl.d/99-podman-privileged-ports.conf` and add the following line to it:
    ```
    net.ipv4.ip_unprivileged_port_start=0
    ```

3.  **Run the application:**
    You can use the same `docker-compose.yml` file with `podman-compose`:
    ```bash
    podman-compose up -d
    ```

4.  **Check the logs:**
    ```bash
    podman-compose logs -f
    ```

## How to Register the App with Telegram

To use this application as a Telegram Mini App, you need to register it with Telegram's `@BotFather`.

1.  **Start a chat with `@BotFather`** in Telegram.

2.  **Create a new bot:**
    - Send the `/newbot` command.
    - Follow the instructions to choose a name and username for your bot.
    - `@BotFather` will give you a token for your new bot. Keep this token safe, as you will need it later if you want to send notifications from the backend.

3.  **Set up the Mini App:**
    - Send the `/mybots` command and choose your bot.
    - Go to **Bot Settings** > **Menu Button**.
    - Choose **Configure Menu Button**.
    - Send the URL of your application, including `https://`. For example: `https://t1.kfamcloud.com`
    - `@BotFather` will then ask you to provide a name for the menu button, for example "Open App".

4.  **Done!**
    Now you can go to your bot in Telegram, and you should see the menu button you configured. Clicking it will open your Mini App inside Telegram.
