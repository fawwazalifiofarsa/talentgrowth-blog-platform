# AGENTS.md

## Project Overview

This project is a full-stack blog platform for a Full-Stack Developer case study.

The application allows users to register, log in, create blog posts, view posts, edit or delete their own posts, comment on posts, manage their profile, optionally upload a profile picture, search posts, paginate post lists, and write blog content using Markdown.

Keep the implementation focused on the documented blog platform scope. Do not add extra SaaS, admin, social media, or enterprise features unless explicitly requested.

## Source of Truth

Before making changes, read the relevant documentation files:

* `README.md`
* `docs/design.md`
* `docs/roadmap.md`
* `docs/database.md`
* `docs/auth.md`
* `docs/api.md`
* `docs/architecture.md`

All files inside `docs/` use lowercase filenames.

If implementation details conflict with documentation, follow the documentation unless the user explicitly instructs otherwise.

## Tech Stack

Use the following stack:

* Next.js
* React
* TypeScript
* Tailwind CSS
* Next.js Route Handlers under `app/api`
* Local PostgreSQL
* Prisma ORM
* Custom JWT authentication
* bcrypt password hashing

Do not use external auth/database/storage providers.

Do not create a separate backend service.

Do not use NextAuth unless explicitly requested.

Do not replace Prisma with direct database queries for normal application CRUD unless explicitly requested.

## Package Manager

Use the package manager already used by the project.

Check for lockfiles:

* `package-lock.json` means use `npm`
* `pnpm-lock.yaml` means use `pnpm`
* `yarn.lock` means use `yarn`
* `bun.lockb` means use `bun`

If no lockfile exists, prefer `npm`.

## Scope Rules

Required features:

* User registration
* User login
* User logout
* JWT-based authentication
* bcrypt password hashing
* User profile page
* Optional profile picture support
* Blog post CRUD
* Comment CRUD
* Author-only edit/delete authorization
* Search posts by title and content
* Pagination for post listing
* Markdown writing and rendering
* Validation and error handling
* Responsive design

Out of scope:

* External auth/database/storage providers
* Separate backend service
* Separate backend service
* NextAuth
* Admin dashboard
* User roles beyond ownership checks
* Likes
* Bookmarks
* Follow system
* Notifications
* Analytics dashboard
* Draft scheduling
* Email notifications
* Rich text editor
* Multi-tenant organizations
* Team/workspace features
* Payment or subscription system
* Deployment automation
* Git/commit automation

Do not add out-of-scope features unless explicitly requested.

## Deployment and Git Rules

The user will handle deployment and Git operations manually.

Do not:

* Add deployment scripts unless requested
* Add CI/CD configuration unless requested
* Change Git remote settings
* Create commit messages unless requested
* Add deployment documentation unless requested
* Add commit convention documentation unless requested

## Architecture Rules

Use this general request flow:

```txt
User
-> Next.js Page / Component
-> Next.js Route Handler in app/api
-> Prisma ORM
-> Local PostgreSQL
```

Use this authentication flow:

```txt
User submits credentials
-> Next.js auth Route Handler
-> bcrypt password hashing or verification
-> JWT access token issued
-> Frontend sends token for protected requests
```

Prisma must only be used server-side.

Do not import Prisma into client components.

Do not expose `JWT_SECRET` to the browser.

## Database Rules

Use Prisma models based on `docs/database.md`.

Main models:

* `User`
* `Post`
* `Comment`

Database table names:

* `users`
* `posts`
* `comments`

Use UUID primary keys.

Use mapped snake_case database columns where appropriate.

Expected relationships:

* `User` has many `Post`
* `User` has many `Comment`
* `Post` belongs to `User`
* `Post` has many `Comment`
* `Comment` belongs to `Post`
* `Comment` belongs to `User`

Use `author_id` for post and comment ownership.

Do not store plain text passwords.

Store only bcrypt password hashes in `users.password_hash`.

## Environment Variables

Expected environment variables:

```env
DATABASE_URL=""
JWT_SECRET=""
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

Do not hardcode secrets.

Do not print secrets in logs.

Do not expose server-only secrets in client components.

## API Rules

Follow `docs/api.md`.

Use these API routes unless the user explicitly changes the route plan:

```txt
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout

GET    /api/posts
POST   /api/posts
GET    /api/posts/[id]
PUT    /api/posts/[id]
DELETE /api/posts/[id]

GET    /api/posts/[id]/comments
POST   /api/posts/[id]/comments
PUT    /api/comments/[id]
DELETE /api/comments/[id]

GET    /api/profile
PUT    /api/profile
```

The case-study route `/posts` maps to `/api/posts`.

The case-study route `/auth/login` maps to `/api/auth/login`.

## API Response Format

Use a consistent JSON response format.

Success response:

```json
{
  "success": true,
  "data": {}
}
```

Success message response:

```json
{
  "success": true,
  "message": "Action completed successfully"
}
```

Error response:

```json
{
  "success": false,
  "message": "Error message"
}
```

Validation error response:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {}
}
```

Use appropriate HTTP status codes:

* `200` for successful read/update/delete
* `201` for successful create
* `400` for validation or invalid request
* `401` for unauthenticated requests
* `403` for authenticated but not allowed
* `404` for missing resources
* `409` for duplicate email
* `500` for unexpected server errors

## Authorization Rules

All protected actions must check authentication on the server.

All ownership actions must check authorization on the server.

Public users can:

* View all posts
* View post detail
* View comments
* Search posts
* Use pagination

Authenticated users can:

* Create posts
* Create comments
* View their own profile
* Update their own profile
* Upload their own profile picture if implemented

Post authors can:

* Edit their own posts
* Delete their own posts

Comment authors can:

* Edit their own comments
* Delete their own comments

Ownership checks:

```txt
post.author_id === currentUser.id
comment.author_id === currentUser.id
profile.id === currentUser.id
```

Client-side visibility is only for user experience.

Server-side authorization is required.

## Auth Helper Rules

Prefer shared server-side helpers for auth logic.

Recommended helpers:

```txt
getCurrentUser()
requireAuth()
requirePostOwner(postId)
requireCommentOwner(commentId)
```

Avoid duplicating token parsing and user lookup logic across route handlers.

## Validation Rules

Validate input before database writes.

Required validation:

* Register name is required
* Register email is required and must be valid
* Register password is required
* Login email is required and must be valid
* Login password is required
* Post title is required
* Post content is required
* Comment content is required
* Profile name is required
* Avatar file is required for upload if avatar upload is implemented
* Avatar file must be an image if avatar upload is implemented
* Avatar file must follow the configured size limit if avatar upload is implemented

Prefer reusable validation schemas/helpers.

Keep validation messages clear and user-friendly.

## UI Rules

Follow `docs/design.md`.

Core pages:

* Home page
* Post detail page
* Create post page
* Edit post page
* Login page
* Register page
* Profile page

UI should include:

* Loading states
* Error states
* Empty states
* Validation messages
* Delete confirmation for destructive actions
* Responsive layout for desktop, tablet, and mobile

Do not overdesign.

Use simple, readable UI.

## Markdown Rules

Store raw Markdown in `posts.content`.

Do not store rendered HTML in the database.

Render Markdown in the application layer.

Support common Markdown syntax:

* Headings
* Bold text
* Italic text
* Lists
* Links
* Inline code
* Code blocks

Render content safely.

## Search and Pagination Rules

Search is handled through:

```txt
GET /api/posts?search=keyword
```

Pagination is handled through:

```txt
GET /api/posts?page=1&limit=10
```

Search and pagination should work together:

```txt
GET /api/posts?page=1&limit=10&search=nextjs
```

Search fields:

* `title`
* `content`

Posts should be ordered by newest first.

Use safe defaults:

* Default page: `1`
* Default limit: `10`

Use a safe maximum limit.

## Profile Picture Rules

Profile picture support is optional polish.

Do not use removed storage providers.

Store metadata in the user table if implemented:

* `avatar_url`
* `avatar_path`

Validate:

* File exists
* File is an image
* File follows size limit

## Parallel Workstream Rules

This project may be developed using multiple Codex threads.

Before starting parallel feature work, shared contracts should already exist:

* Prisma schema
* Auth helpers
* API response helpers
* Validation pattern
* Route naming
* Base UI conventions

Avoid multiple threads editing these files at the same time:

* `prisma/schema.prisma`
* Prisma migration files
* Shared auth helpers
* Shared API response helpers
* Shared validation helpers
* Global layout files
* Global CSS/theme files
* Environment files

When working in a specific thread, stay inside the assigned scope.

Do not refactor unrelated files unless needed.

Do not introduce new patterns when an existing project pattern already exists.

## Recommended Workstreams

Safe workstreams after foundation is stable:

```txt
Auth pages and JWT flow
Posts API
Post listing and detail UI
Base UI components
Create/edit post forms
Comments API and UI
Profile page
Markdown rendering
Search and pagination polish
Responsive and validation polish
```

Each workstream should keep changes focused and small enough to review.

## Code Quality Rules

Use TypeScript.

Prefer clear names over clever abstractions.

Keep functions focused.

Avoid unnecessary abstraction.

Avoid duplicate logic.

Keep server-only code out of client components.

Handle expected errors.

Do not swallow errors silently.

Do not add unrelated libraries without a clear need.

## Before Finishing a Task

Before marking a task complete, check:

* The app still compiles
* TypeScript errors are resolved
* The changed feature follows the docs
* Protected actions check authentication
* Owner-only actions check authorization
* Validation errors are handled
* API responses follow the standard format
* UI has loading/error/empty states where relevant
* No out-of-scope features were added
* No secrets were exposed

## Manual Testing Expectations

For relevant changes, manually test the affected flow.

Important flows:

* Register
* Login
* Logout
* Create post
* View post list
* View post detail
* Edit own post
* Delete own post
* Prevent editing another user's post
* Add comment
* Edit own comment
* Delete own comment
* Prevent editing another user's comment
* View profile
* Search posts
* Paginate posts
* Render Markdown
* Check responsive layout

## Final Reminder

Build the required blog platform well.

Do not overbuild.

Do not add features outside the documented scope unless explicitly requested.
