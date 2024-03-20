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
    participant db
    
    autonumber 1
    client ->> server: [POST] /api/url
    Note over server: check input url is valid
    alt
        Note over server: url is invalid
        server ->> client: reponse 400: url is invalid.
    else
        autonumber 2
        Note over server: url is valid

        alt 
            Note over server, db: 用戶已登入，並帶有效的JWT token
            server ->> db: 寫入短網址<br>table:urls, users
        else
        Note over server, db: 用戶未登入
            server ->> db: 寫入短網址<br>table:urls
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
        Note over client, server: 用戶未登入，回傳空陣列
        server ->> client: reponse 200: OK.
    else
        Note over server, db: 用戶登入，讀取用戶已建立url
        server ->> db: 查詢url資料表
        db ->> server: 回傳url資料
        Note over client, server: 回傳結果
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
    participant db
    
    autonumber 1
    client ->> server: [GET] /api/url/{shortUrl}
    server ->> db: 取出短網址對應的原始網址
    alt
        Note over server, db: 資料存在
        server ->> client: reponse 302: Found.
    else
        Note over server, db: 資料不存在
        server ->> client: reponse 400: Bad Request.
    end
```
