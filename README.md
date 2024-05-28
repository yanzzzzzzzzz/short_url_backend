# Short Url Backend

## Introduction

The Short URL Backend is a service that provides URL shortening functionality to create short aliases for long URLs. This README file provides the necessary information to get started with the backend service.

## Installation

To get started with the Short URL Backend, you need to perform the following steps:

### Clone the repository

```bash
git clone https://github.com/yanzzzzzzzzz/short_url_backend.git
```

### Install dependencies

```bash
npm install
```

### Create env file

Create a `.env` file with the following information:

```bash
PORT=<your_port_number>  # The port number on which the server will listen for incoming connections.
MONGODB_URI=<your_mongodb_connection_string>  # The URI for connecting to the MongoDB database used by the application.
TEST_MONGODB_URI=<your_mongodb_connection_string_for_test>  # The URI for connecting to the MongoDB database used for testing purposes.
SECRET=<secret_string_use_by_jwt_token>  # The secret key used for signing and verifying JSON Web Tokens (JWTs) for authentication and authorization.
REDIS_PASSWORD=<your_redis_password>  # The password for authenticating with the Redis database server.
REDIS_HOST=<your_redis_host>  # The hostname of the Redis database server.
REDIS_PORT=<your_redis_port>  # The port number on which the Redis database server is running.
GOOGLE_CLIENT_ID=<your_google_client_id>  # The client ID for Google OAuth 2.0 authentication.
GOOGLE_CLIENT_SECRET=<your_google_client_secret>  # The client secret for Google OAuth 2.0 authentication.
GOOGLE_OAUTH_REDIRECT_URL=<your_google_oauth_redirectUrl>  # The redirect URL to which Google will send the authorization response.
FRONTEND_URL=<your_front_end_Url>  # The URL of the frontend application, which is used for CORS (Cross-Origin Resource Sharing) and redirection purposes.

```

### Redis

You can use use [Redis cloud](https://app.redislabs.com/#/databases) for Redis setup.

### Start the server

```bash
npm run dev
```

## API

For API documentation, please refer to the [short_url_api.md](/docs/api/short_url_api.md) file.
