# url API

## POST /api/url

### Authorization

* JWT

### Request

Request Body

| Field  | Type   | Required | Description |
| ------ | ------ | :------: | ----------- |
| url    | string | Yes      | 原始網址 |

### Response

| Field   | Type   | Description |
| ------- | ------ | ----------- |
| originUrl  | string | 原始網址 |
| shortUrl    | string | 短網址 |

### Flow

```mermaid
sequenceDiagram
    participant client
    participant server
    participant redis
    participant db
    
    autonumber 1
    client ->> server: [POST] /api/url
    Note over server: Check if the input URL is valid.
    alt
        Note over server: URL is invalid.
        server ->> client: reponse 400: URL is invalid.
    else
        autonumber 2
        Note over server: URL is valid.
        server ->> redis: Write the data to Redis.<br>key:{shortUrl}, value:{originalUrl}<br>Set an expiration time: 1hr.
        server ->> db: Write the data to database.<br>table:urls, users.
        alt 
            Note over server, db: User is already logged in with a valid JWT token.
                    server ->> db: Write the data to database.<br>table:users.
        else
        end
        
        server ->> client: reponse 200: OK
    end
```

## GET /api/url

### Authorization

* JWT

### Request

* None

### Response

* Returns an array of objects representing the URLs.

| Field   | Type   | Description |
| ------- | ------ | ----------- |
| originUrl  | string | 原始網址 |
| shortUrl    | string | 短網址 |

### Flow

```mermaid
sequenceDiagram
    participant client
    participant server
    participant db
    
    autonumber 1
    client ->> server: [GET] /api/url
    
    alt
        Note over client, server: User not logged in.<br>returning an empty array.
        server ->> client: reponse 200: OK.
    else
        Note over server, db: User logged in.
        server ->> db: Querying the URL data table.
        db ->> server: Return URL data.
        server ->> client: reponse 200: OK
    end
```

## GET `/api/url/{shortUrl}`

### Request

* None

### Response

* Redirect to original url

### Flow

```mermaid
sequenceDiagram
    participant client
    participant server
    participant redis
    participant db
    
    autonumber 1
    client ->> server: [GET] /api/url/{shortUrl}
    server ->> redis: Retrieve the short URL corresponding to the original URL.
    alt
        Note over server, redis: Data exists on redis.
        server ->> client: reponse 302: Found.
    else
        Note over server, redis: Data does not exist in Redis.
        server ->> db: Retrieve the short URL corresponding to the original URL.
        alt
            Note over server, db: Data exists on database.
            server ->> redis: Write the data to Redis.<br>key:{shortUrl}, value:{originalUrl}<br>Set an expiration time: 1hr.
            server ->> client: reponse 302: Found.
        else 
            Note over server, db: Data does not exist in the database.
            server ->> client: reponse 400: Bad Request.
        end
    end
```
