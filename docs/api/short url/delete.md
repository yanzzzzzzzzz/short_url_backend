# Delete Short URL

**DELETE** `{domain}/api/url/{shortUrl}`

## Authorization

* JWT

## Request

* None

## Response

### Status code

* **204 No Content**: Successful deletion of the URL.
* **401 Unauthorized**: The URL was created by a guest or an unauthenticated user.
* **404 Not Found**: The URL does not exist.
* **403 Forbidden**: Cannot delete the URL created by another user.

## Flow

```mermaid
sequenceDiagram
    participant client
    participant server
    participant redis
    participant db
    
    autonumber 1
    client ->> server: [DELETE] /api/url/{shortUrl}
    server ->> db: Check if the URL exists
    alt URL does not exist
        server ->> client: response 404: URL not found
    else URL exists
        server ->> db: Check URL creator
        alt Created by guest
            server ->> client: response 401: This URL was created by a guest or an unauthenticated user.<br>Please create an account/log in to perform more actions
        else Created by user
            server ->> server: Check if the logged-in user is the creator
            alt No permission to delete
                server ->> client: response 403: Unauthorized: Cannot delete URL by another user
            else Has permission to delete
                server ->> db: Delete URL
                server ->> redis: Remove URL from cache
                server ->> client: response 204: No Content
            end
        end
    end
```
