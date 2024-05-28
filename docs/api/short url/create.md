# create short url

**POST** `{domain}/api/url`

## Authorization

* JWT

## Request

Request Body

| Field  | Type   | Required | Description |
| ------ | ------ | :------: | ----------- |
| url    | string | Yes      | Original URL |
| customShortUrl    | string | No      | Custom short URL |

## Response

| Field   | Type   | Description |
| ------- | ------ | ----------- |
| originUrl  | string | Original URL |
| shortUrl    | string | Short URL |
| createTime    | string | Creation time |
| title    | string | Original URL title |
| previewImage | string | Preview image |

### Status code

* **200 OK**: Successful create the URL.
* **400 Bad Request**: Invalid input URL format.
* **409 Conflict**: Duplicate short URL exists.

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
        server ->> client: response 400: Bad Request<br>{error: "Invalid input URL format"}
    else URL is valid
        autonumber 2
        Note over server: Check if custom short URL is provided
        alt Custom short URL is provided
            server ->> db: Check for duplicate in database
            alt Duplicate exists
                server ->> client: response 409: Conflict<br>{error: "Duplicate short URL exists"}
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
