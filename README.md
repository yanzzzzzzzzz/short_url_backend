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
```

Start the server:

```bash
npm run dev
```

## RESTful API for URL Shortening Service

* GET /urls: Fetches all URLs in the collection.
* GET /urls/:shortUrl: Fetches a single URL by its shortUrl identifier.
* POST /urls: Creates a new URL resource based on the request data.
* DELETE /urls/:shortUrl: Removes the identified URL by its shortUrl identifier.
* PUT /urls/:shortUrl: Replaces the entire identified URL with the request data.
* PATCH /urls/:shortUrl: Updates a subset of properties of the identified URL with the request data.
