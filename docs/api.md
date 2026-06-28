# API Documentation

The backend API is implemented with Next.js Route Handlers under `app/api`.

The case-study PDF names routes without the Next.js `/api` prefix. This project maps those routes to standard App Router API paths.

## Standard Response Format

Success:

```json
{
  "success": true,
  "data": {}
}
```

Success message:

```json
{
  "success": true,
  "message": "Action completed successfully"
}
```

Error:

```json
{
  "success": false,
  "message": "Error message"
}
```

Validation error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {}
}
```

## Authentication

Protected routes require:

```txt
Authorization: Bearer <token>
```

The token is issued by `/api/auth/register` or `/api/auth/login`.

## Status Codes

| Status | Usage |
| ---: | --- |
| `200` | Successful read, update, delete, or message response |
| `201` | Successful create |
| `400` | Invalid request or validation error |
| `401` | Missing or invalid authentication |
| `403` | Authenticated but not allowed |
| `404` | Resource not found |
| `409` | Duplicate resource conflict |
| `500` | Unexpected server error |

## Route Mapping

```txt
POST /auth/register -> POST /api/auth/register
POST /auth/login    -> POST /api/auth/login
POST /auth/logout   -> POST /api/auth/logout

GET  /posts         -> GET  /api/posts
POST /posts         -> POST /api/posts
GET  /posts/:id     -> GET  /api/posts/[id]
PUT  /posts/:id     -> PUT  /api/posts/[id]
DELETE /posts/:id   -> DELETE /api/posts/[id]

GET  /posts/:id/comments -> GET  /api/posts/[id]/comments
POST /posts/:id/comments -> POST /api/posts/[id]/comments
PUT  /comments/:id       -> PUT  /api/comments/[id]
DELETE /comments/:id     -> DELETE /api/comments/[id]

GET /profile        -> GET /api/profile
PUT /profile        -> PUT /api/profile
```

## Auth Routes

## Register

```txt
POST /api/auth/register
```

Access: public.

Request:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Success response:

```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "avatarUrl": null
    }
  }
}
```

Errors:

* `400` validation error
* `409` user already exists

## Login

```txt
POST /api/auth/login
```

Access: public.

Request:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Success response returns a JWT token and safe user object.

Errors:

* `400` validation error
* `401` invalid email or password

## Logout

```txt
POST /api/auth/logout
```

Access: public or authenticated. JWT logout is client-side token deletion.

Response:

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Posts Routes

## Get Posts

```txt
GET /api/posts
```

Access: public.

Query params:

| Param | Type | Default | Notes |
| --- | --- | --- | --- |
| `page` | number | `1` | Minimum `1` |
| `limit` | number | `10` | Maximum `50` |
| `search` | string | empty | Matches title or content |

Example:

```txt
GET /api/posts?page=1&limit=10&search=nextjs
```

Success response:

```json
{
  "success": true,
  "data": {
    "posts": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 0,
      "totalPages": 0
    }
  }
}
```

Posts are ordered by newest first and include author info.

## Create Post

```txt
POST /api/posts
```

Access: authenticated.

Request:

```json
{
  "title": "Post title",
  "description": "Optional summary",
  "content": "# Markdown content"
}
```

Validation:

* `title` is required.
* `content` is required.

The Route Handler uses the current JWT user as `author_id`.

## Get Post

```txt
GET /api/posts/[id]
```

Access: public.

Includes author info. Returns `404` when the post does not exist.

## Update Post

```txt
PUT /api/posts/[id]
```

Access: authenticated post author only.

Request body matches create post. The Route Handler checks:

```txt
post.author_id === currentUser.id
```

Errors:

* `401` unauthorized
* `403` not the post author
* `404` post not found

## Delete Post

```txt
DELETE /api/posts/[id]
```

Access: authenticated post author only.

Success:

```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

## Comments Routes

## Get Comments

```txt
GET /api/posts/[id]/comments
```

Access: public.

Returns comments for the post with author info. Returns `404` when the post does not exist.

## Create Comment

```txt
POST /api/posts/[id]/comments
```

Access: authenticated.

Request:

```json
{
  "content": "This is a comment."
}
```

Validation:

* `content` is required.

The Route Handler verifies the post exists and uses the current JWT user as `author_id`.

## Update Comment

```txt
PUT /api/comments/[id]
```

Access: authenticated comment author only.

Request:

```json
{
  "content": "Updated comment."
}
```

The Route Handler checks:

```txt
comment.author_id === currentUser.id
```

## Delete Comment

```txt
DELETE /api/comments/[id]
```

Access: authenticated comment author only.

Success:

```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

## Profile Routes

## Get Profile

```txt
GET /api/profile
```

Access: authenticated.

Returns the current safe user profile and the user's posts.

## Update Profile

```txt
PUT /api/profile
```

Access: authenticated.

Request:

```json
{
  "name": "Updated Name",
  "avatarUrl": "https://example.com/avatar.png",
  "avatarPath": "avatars/user-id/avatar.png"
}
```

Only `name` is required when updating the profile.

## Validation Summary

| Resource | Field | Rule |
| --- | --- | --- |
| Register | `name` | Required |
| Register | `email` | Required and valid email |
| Register | `password` | Required |
| Login | `email` | Required and valid email |
| Login | `password` | Required |
| Post | `title` | Required |
| Post | `content` | Required |
| Comment | `content` | Required |
| Profile | `name` | Required |

## Authorization Summary

| Action | Public | Authenticated | Owner Required |
| --- | ---: | ---: | ---: |
| View posts | Yes | Yes | No |
| View post detail | Yes | Yes | No |
| Search posts | Yes | Yes | No |
| View comments | Yes | Yes | No |
| Register/login/logout | Yes | Yes | No |
| Create post | No | Yes | No |
| Edit post | No | Yes | Yes |
| Delete post | No | Yes | Yes |
| Create comment | No | Yes | No |
| Edit comment | No | Yes | Yes |
| Delete comment | No | Yes | Yes |
| View profile | No | Yes | Yes |
| Update profile | No | Yes | Yes |
