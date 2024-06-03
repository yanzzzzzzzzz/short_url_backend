# Short Url Backend

## Testing Environment

* Windows

## Quick Start

### Requirement

* [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Steps

Clone the repository and run the Docker deployment script:
  
  ```bash
    npm run docker-deploy
  ```

## Run in Development Mode

1. Run `npm install`
2. Create a .env file with the following content `SECRET = 1234`

## Configuration

### Optional Environment Variables

Create a .env file to set other parameters as needed.

### Google Login API

:link:[Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow?hl=zh-tw)

Add the following parameters to the .env file for Google OAuth 2.0 authentication:

```bash
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
GOOGLE_OAUTH_REDIRECT_URL=<your_google_oauth_redirect_url>
FRONTEND_URL=<your_frontend_url_after_login_success_will_rediret>
```

### Other Parameters

Add the following parameters to the .env file to configure MongoDB, Redis, and the server port:

```bash
PORT=<your_port_number>
MONGODB_URI_DOCKER=<your_mongodb_connection_string>
MONGODB_URI_DEV=<your_mongodb_connection_string_for_dev>
MONGODB_NAME=<your_mongodb_database_name>
REDIS_PASSWORD=<your_redis_password>
REDIS_HOST=<your_redis_host>
REDIS_PORT=<your_redis_port>
```

## API

For API documentation, please refer to the [doc](/docs/api/short%20url).
