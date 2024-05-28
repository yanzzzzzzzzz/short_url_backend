# Redirect url

**GET** `{domain}/api/url/{shortUrl}`

## Request

* None

## Response

* Redirect to the original URL with status code 302 if found.
* Return status code 404 if the URL is not found.

## Flow

```mermaid
sequenceDiagram
    participant client
    participant server
    participant redis
    participant db
    
    autonumber 1
    client ->> server: [GET] /api/url/{shortUrl}
    server ->> redis: Retrieve original URL for {shortUrl}
    alt Data exists in Redis
        server ->> client: response 302: Found
    else Data does not exist in Redis
        server ->> db: Retrieve original URL for {shortUrl}
        alt Data exists in database
            server ->> redis: Cache original URL in Redis<br>key: {shortUrl}, value: {originalUrl}<br>Set expiration: 1hr
            server ->> client: response 302: Found
        else Data does not exist in database
            server ->> client: response 404: Not Found
        end
    end
```
