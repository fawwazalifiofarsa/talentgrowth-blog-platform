# Architecture

This document describes the Next.js App Router architecture for the Talent Growth Blog Platform.

## Overview

```txt
Browser
-> Next.js frontend
-> Next.js Route Handlers in app/api
-> Prisma ORM
-> PostgreSQL
```

The project uses the default Next.js structure. Frontend pages and components live in `app/` and `components/`. Backend API handlers live in `app/api/`.

There is no separate Node API server and no separate backend directory.

## Main Technologies

## Next.js Frontend

Next.js handles:

* Public and authenticated pages
* React components
* Forms and client-side state
* Search and pagination UI
* Markdown rendering
* Calling backend Route Handlers through `/api`

## Next.js Route Handlers

Route Handlers under `app/api` are the backend API layer.

Responsibilities:

* Auth routes
* Posts routes
* Comments routes
* Profile routes
* Request validation
* JWT verification
* Ownership authorization
* Consistent JSON responses
* Server-side Prisma queries

## Prisma ORM

Prisma is used by server-side code only.

Responsibilities:

* Define `User`, `Post`, and `Comment` models
* Generate the type-safe database client
* Run local PostgreSQL queries
* Manage migrations

The frontend must never import Prisma.

## PostgreSQL

PostgreSQL stores:

* Users and password hashes
* Blog posts
* Comments
* Optional avatar metadata

## API Route Mapping

The case-study PDF lists routes like `/posts` and `/auth/login`. In this Next.js project, those are implemented with the standard `/api` prefix.

```txt
Case study /auth/register -> /api/auth/register
Case study /auth/login    -> /api/auth/login
Case study /auth/logout   -> /api/auth/logout

Case study /posts         -> /api/posts
Case study /posts/:id     -> /api/posts/[id]

Case study /posts/:id/comments -> /api/posts/[id]/comments
Case study /comments/:id       -> /api/comments/[id]

Case study /profile       -> /api/profile
```

## Authentication

Authentication is custom JWT authentication implemented manually in backend Route Handlers and shared server helpers.

```txt
User submits credentials
-> /api/auth route handler
-> bcrypt password hashing or verification
-> JWT access token returned and set in an HTTP-only cookie
-> protected requests use Authorization: Bearer <token> or cookie fallback
```

Protected API requests may use:

```txt
Authorization: Bearer <token>
```

Browser requests can also authenticate through the HTTP-only auth cookie. When both are present, the `Authorization` header takes priority. A malformed `Authorization` header is rejected with `401` rather than falling back to the cookie.

The auth helper:

* Reads the `Authorization` header first
* Accepts only the `Bearer <token>` format when the header is present
* Falls back to the HTTP-only auth cookie when no header is present
* Verifies the JWT with `JWT_SECRET`
* Loads the current user from PostgreSQL
* Returns `401` for missing or invalid tokens

## Data Flow

## Public Post Listing

```txt
User opens home page
-> Next.js page requests GET /api/posts
-> Route Handler validates query params
-> Prisma fetches posts from PostgreSQL
-> Route Handler returns posts and pagination metadata
-> UI displays post cards
```

## Create Post

```txt
Authenticated user submits form
-> Frontend sends POST /api/posts with Bearer token
-> Route Handler resolves current user
-> Route Handler validates title and content
-> Prisma creates post with author_id
-> Route Handler returns created post
```

## Edit or Delete Post

```txt
Authenticated user submits action
-> Route Handler resolves current user from JWT
-> Route Handler fetches post
-> Route Handler checks post.author_id === currentUser.id
-> Prisma updates or deletes the post
```

## Comments

```txt
User loads post comments
-> Frontend calls GET /api/posts/[id]/comments
-> Route Handler returns comments with author info
```

```txt
Authenticated user creates or edits a comment
-> Frontend sends Bearer token
-> Route Handler resolves current user
-> Route Handler validates content
-> Route Handler checks ownership for edit/delete
-> Prisma writes the comment
```

## Profile

```txt
Authenticated user opens profile
-> Frontend calls GET /api/profile with Bearer token
-> Route Handler resolves current user
-> Route Handler returns safe user data and the user's posts
```

Profile picture upload is optional case-study polish. It must not use removed storage providers.

## Security Boundaries

The client can hide or show buttons for user experience, but server-side checks are mandatory.

The backend Route Handlers must:

* Hash passwords with bcrypt
* Store only `password_hash`
* Sign and verify JWTs with `JWT_SECRET`
* Reject unauthenticated protected requests
* Enforce post and comment ownership
* Never return `password_hash`
* Never log secrets

## Authorization Rules

```txt
post.author_id === currentUser.id
comment.author_id === currentUser.id
profile.id === currentUser.id
```

No roles are required. Users can manage only resources they created.

## Out of Scope

* External auth/database/storage providers
* Separate backend service
* Separate backend service
* NextAuth
* Admin dashboard
* User roles
* Likes, bookmarks, follows, notifications, analytics, payments, or teams
