# Authentication and Authorization

The Talent Growth Blog Platform uses custom JWT authentication implemented in Next.js Route Handlers and shared server-side helpers.

The project does not use external auth providers, a separate Node API server, or NextAuth.

## Goals

* Register users with name, email, and password
* Log users in with email and password
* Expose logout route for the case-study contract
* Hash passwords with bcrypt
* Store passwords only as `password_hash`
* Issue JWT access tokens
* Verify JWTs in protected Route Handlers
* Let authenticated users change their password
* Enforce author-only post and comment actions

## Auth Routes

The case-study auth routes map to Next.js Route Handlers:

```txt
POST /auth/register -> POST /api/auth/register
POST /auth/login    -> POST /api/auth/login
POST /auth/logout   -> POST /api/auth/logout
PUT  /auth/password -> PUT  /api/auth/password
```

## Registration Flow

```txt
User submits name, email, password
-> /api/auth/register validates input
-> Route Handler checks duplicate email
-> Route Handler hashes password with bcrypt
-> Prisma creates user
-> Route Handler signs JWT
-> Route Handler returns token and safe user data
```

Request:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Validation:

* `name` is required.
* `email` is required and must be valid.
* `password` is required.
* Duplicate email returns a clear error.

The response must not include `password_hash`.

## Login Flow

```txt
User submits email and password
-> /api/auth/login validates input
-> Route Handler finds user by email
-> Route Handler compares password with bcrypt
-> Route Handler signs JWT
-> Route Handler returns token and safe user data
```

Request:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Invalid credentials should return a clear `401` response without exposing whether the email or password was wrong.

## Logout Flow

JWT access tokens are stateless, so logout is handled by the frontend deleting the stored token.

The backend still exposes:

```txt
POST /api/auth/logout
```

It returns:

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```


## Protected Change Password Flow

Email-based password reset is out of scope. The app does not implement forgot-password pages, reset-password pages, reset tokens, or email sending.

Authenticated users can change their password from their account/profile area.

```txt
User submits current password and new password
-> Frontend sends PUT /api/auth/password with Authorization: Bearer <token>
-> Route Handler verifies the JWT
-> Route Handler loads the current user with Prisma
-> Route Handler compares current password with bcrypt
-> Route Handler hashes the new password with bcrypt
-> Prisma updates users.password_hash
-> Route Handler returns a success message
```

Request:

```json
{
  "currentPassword": "old-password",
  "newPassword": "new-password"
}
```

Rules:

* User must be authenticated.
* `currentPassword` is required.
* `newPassword` is required.
* The current password must match the stored hash.
* The new password is stored only as a bcrypt hash.
* The response must never include `password_hash`.
## Protected Request Flow

The frontend sends the token on protected requests:

```txt
Authorization: Bearer <token>
```

The server-side auth helper:

* Reads the `Authorization` header from the `Request`
* Requires a `Bearer` token
* Verifies the token with server-only `JWT_SECRET`
* Loads the current user from PostgreSQL through Prisma
* Returns or throws an unauthorized response for missing, invalid, or stale tokens

## Token Payload

The JWT should contain minimal identity data:

```json
{
  "sub": "user-id",
  "email": "john@example.com"
}
```

Do not include password hashes or sensitive data in the token.

## Protected Actions

Authentication is required for:

* Create post
* Edit post
* Delete post
* Create comment
* Edit comment
* Delete comment
* View profile
* Update profile
* Upload avatar if implemented
* Change own password

Public users can:

* View posts
* View post details
* View comments
* Search posts
* Use pagination

## Ownership Checks

Authorization confirms the current user owns the resource being modified.

Post ownership:

```txt
post.author_id === currentUser.id
```

Comment ownership:

```txt
comment.author_id === currentUser.id
```

Profile ownership:

```txt
profile.id === currentUser.id
```

Client-side visibility is only for user experience. The Route Handler must enforce ownership.

## Error Cases

| Case | Status | Message |
| --- | ---: | --- |
| Missing token | `401` | `Unauthorized` |
| Invalid token | `401` | `Unauthorized` |
| Invalid login | 401 | Invalid email or password |
| Incorrect current password | 400 or 403 | Current password is incorrect |
| Duplicate email | `409` | `User already exists` |
| Post not found | `404` | `Post not found` |
| Comment not found | `404` | `Comment not found` |
| Not post author | `403` | `You are not allowed to modify this post` |
| Not comment author | `403` | `You are not allowed to modify this comment` |

## Security Checklist

* Passwords are hashed with bcrypt before database storage.
* Plain text passwords are never stored.
* `password_hash` is never returned in API responses.
* `JWT_SECRET` is required only in server-side environment variables.
* Protected Route Handlers verify JWTs.
* Post and comment mutations verify ownership.
* The frontend sends Bearer tokens for protected requests.
* Logout removes the client token and calls POST /api/auth/logout.
* Password change verifies the current password before updating password_hash.

