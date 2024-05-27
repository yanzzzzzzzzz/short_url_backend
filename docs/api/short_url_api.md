# url API

## POST /api/url

### Authorization

* JWT

### Request

Request Body

| Field  | Type   | Required | Description |
| ------ | ------ | :------: | ----------- |
| url    | string | Yes      | 原始網址 |
| customShortUrl    | string | No      | 自定義短網址 |

### Response

| Field   | Type   | Description |
| ------- | ------ | ----------- |
| originUrl  | string | 原始網址 |
| shortUrl    | string | 短網址 |
| createTime    | string | 建立時間 |
| title    | string | 原始網址標題 |
| previewImage | string | 預覽圖片 |

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
        Note over server: 檢查input存在自訂義短網址
        alt 
            Note over server: input 存在自訂義短網址
            server ->> db: 檢查是否有跟database重複
            alt
                Note over server, db: 跟database重複
                server ->>client: client: reponse 400: Duplicate short URL exists.
            else 
                Note over server, db: 跟database不重複, 使用自訂義短網址
            end
        else
        autonumber 2
            Note over server: input 不存在自訂義短網址
            server ->> server: 產生不跟database重複的短網址
        end

        Note over server: 獲取網頁內容，取出web title、preview image、description
        server ->> redis: Write the data to Redis.<br>key:{shortUrl}, value:{originalUrl}<br>Set an expiration time: 1hr.
        server ->> db: Write the data to database.<br>table:urls
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

| Field         | Type   | Required | Description                                 | Default |
| ------------- | ------ | :------: | ------------------------------------------- | ------- |
| page          | string |    No    | The page number to retrieve (for pagination) | 0       |
| pageSize      | string |    No    | The number of items per page (for pagination) | 1000    |
| searchKeyword | string |    No    | Keyword to search in the URL titles          |         |

### Response

* Returns an array of objects representing the URLs.

| Field      | Type             | Description               |
| ---------- | ---------------- | ------------------------- |
| content    | List of Url      | A list of URL objects     |
| pagination | PaginationData   | Pagination details        |

#### Url

| Field        | Type   | Description                    |
| ------------ | ------ | ------------------------------ |
| originUrl    | string | The original URL               |
| shortUrl     | string | The shortened URL              |
| createTime   | string | The time when the URL was created |
| title        | string | The title of the original URL  |
| previewImage | string | A preview image of the URL     |

#### PaginationData

| Field   | Type    | Description                  |
| ------- | ------- | ---------------------------- |
| page    | number  | The current page number      |
| size    | number  | The number of items per page |
| hasNext | boolean | Indicates if there is a next page |
| pageCount | number | The total number of pages    |

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
        server ->> db: Querying the URL data table.<br>Include page, page size, and keyword if specified.
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
