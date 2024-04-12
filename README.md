# Short Url Backend

## Introduction

The Short URL Backend is a service that provides URL shortening functionality to create short aliases for long URLs. This README file provides the necessary information to get started with the backend service.

## Installation

To get started with the Short URL Backend, you need to perform the following steps:

Clone the repository:

```bash
git clone https://github.com/yanzzzzzzzzz/short_url_backend.git
```

Install dependencies:

```bash
npm install
```

Create a `.env` file with the following information:

```bash
PORT=<your_port_number>
MONGODB_URI=<your_mongodb_uri>
SECRET = <secret_string_use_by_jwt_token>
```

Start the server:

```bash
npm run dev
```

## API

[see doc](/docs/api/short_url_api.md)
