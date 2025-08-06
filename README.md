# Class Coordinating App for Telegram

This is a Telegram Mini App for coordinating classes. It allows users to create classes, RSVP, and ask questions.

## How to Run the App

This application is designed to be run with Docker and Docker Compose. For production, it's recommended to use a reverse proxy to handle HTTPS, as Telegram Mini Apps require a secure connection.

### Recommended Setup with Caddy (for automatic HTTPS)

We provide a `docker-compose.yml` file that includes the application and a Caddy server. Caddy will automatically obtain and renew SSL certificates from Let's Encrypt for your domain.

**Prerequisites:**
- A server with Docker and Docker Compose installed.
- A domain name pointing to your server's IP address (e.g., `pet.kfamcloud.com`).

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
    - Send the URL of your application, including `https://`. For example: `https://pet.kfamcloud.com`
    - `@BotFather` will then ask you to provide a name for the menu button, for example "Open App".

4.  **Done!**
    Now you can go to your bot in Telegram, and you should see the menu button you configured. Clicking it will open your Mini App inside Telegram.
