# create short url

**POST** `{domain}/api/url`

## Authorization

* JWT

## Request

Request Body

| Field  | Type   | Required | Description |
| ------ | ------ | :------: | ----------- |
| url    | string | Yes      | 原始網址 |
| customShortUrl    | string | No      | 自定義短網址 |

## Response

| Field   | Type   | Description |
| ------- | ------ | ----------- |
| originUrl  | string | 原始網址 |
| shortUrl    | string | 短網址 |
| createTime    | string | 建立時間 |
| title    | string | 原始網址標題 |
| previewImage | string | 預覽圖片 |

## Flow

```mermaid
sequenceDiagram
    participant client
    participant server
    participant redis
    participant db
    
    autonumber 1
    client ->> server: [POST] /api/url
    Note over server: Check if the input URL is valid
    alt URL is invalid
        server ->> client: response 400: URL is invalid
    else URL is valid
        autonumber 2
        Note over server: Check if custom short URL is provided
        alt Custom short URL is provided
            server ->> db: Check for duplicate in database
            alt Duplicate exists
                server ->> client: response 400: Duplicate short URL exists
            else No duplicate, use custom short URL
        end
        else No custom short URL provided
            server ->> server: Generate a unique short URL
        end

        Note over server: Fetch web content (title, preview image, description)
        server ->> redis: Write data to Redis<br>key:{shortUrl}, value:{originalUrl}<br>Set expiration: 1hr
        server ->> db: Write data to database<br>table: urls
        alt User is logged in with a valid JWT token
            server ->> db: Write data to database<br>table: users
        end
        
        server ->> client: response 200: OK
    end

```
