# Talent Growth Blog Platform

Full-stack blog platform for the Talent Growth Full-Stack Developer case study.

The project uses Next.js App Router for both the frontend and backend API. Frontend pages and React components live in `app/` and `components/`; backend endpoints are implemented as Next.js Route Handlers under `app/api`; database access is server-side only through Prisma and local PostgreSQL.

This project does not use Supabase, NextAuth, Express, or a separate backend service.

## Features

- User registration, login, logout, and protected password changes
- Custom JWT authentication with bcrypt password hashing
- Public post listing with search and pagination
- Public post detail page with safe Markdown rendering
- Authenticated post creation, editing, and deletion
- Author-only post management in `/dashboard`
- Comment listing, creation, editing, and deletion
- Author-only comment edit/delete controls
- Authenticated profile page with own posts
- Profile name update and local avatar upload
- Responsive layout with mobile sidebar navigation

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Next.js Route Handlers
- Local PostgreSQL
- Prisma ORM
- JWT authentication
- bcrypt password hashing
- Zod validation

## Project Flow

```txt
Browser
-> Next.js page or component
-> Next.js Route Handler in app/api
-> Prisma ORM
-> Local PostgreSQL
```

Authentication flow:

```txt
User submits credentials
-> /api/auth route verifies or creates user
-> bcrypt hashes or verifies password
-> JWT is returned in the API response and issued in an HTTP-only cookie
-> protected requests authenticate through Authorization: Bearer <token> or the cookie fallback
```

Ownership checks are enforced on the server:

```txt
post.authorId === currentUser.id
comment.authorId === currentUser.id
profile.id === currentUser.id
```

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

Copy `.env.example` to `.env` and fill in the values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/talentgrowth_blog_platform"
JWT_SECRET="replace-with-a-long-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Never commit `.env` or real secrets.

### 3. Prepare PostgreSQL

Create a local PostgreSQL database matching `DATABASE_URL`.

Example database name:

```txt
talentgrowth_blog_platform
```

### 4. Run Prisma

Validate the schema:

```bash
npx prisma validate
```

Apply existing migrations:

```bash
npx prisma migrate deploy
```

Generate Prisma Client:

```bash
npx prisma generate
```

For local schema changes during development, use:

```bash
npm run prisma:migrate:dev
```

Do not reset the database unless you intentionally want to delete local data.

### 5. Start the app

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Useful Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate:dev
```

Recommended verification before handoff:

```bash
npx prisma validate
npx prisma generate
npm run lint
npm run build
```

## Main Routes

### Pages

| Route | Purpose |
| --- | --- |
| `/` | Public post listing with search and pagination |
| `/posts/[id]` | Public post detail with Markdown and comments |
| `/posts/new` | Authenticated create post page |
| `/posts/[id]/edit` | Authenticated author-only edit page |
| `/dashboard` | Authenticated user's own post management |
| `/profile` | Authenticated profile, avatar, and own posts |
| `/profile/password` | Authenticated password change page |
| `/sign-in` | Login page |
| `/sign-up` | Registration page |

### API

| Method | Route | Access |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Public |
| `POST` | `/api/auth/login` | Public |
| `POST` | `/api/auth/logout` | Public/authenticated |
| `PUT` | `/api/auth/password` | Authenticated |
| `GET` | `/api/posts` | Public |
| `POST` | `/api/posts` | Authenticated |
| `GET` | `/api/posts/[id]` | Public |
| `PUT` | `/api/posts/[id]` | Author only |
| `DELETE` | `/api/posts/[id]` | Author only |
| `GET` | `/api/posts/[id]/comments` | Public |
| `POST` | `/api/posts/[id]/comments` | Authenticated |
| `PUT` | `/api/comments/[id]` | Comment author only |
| `DELETE` | `/api/comments/[id]` | Comment author only |
| `GET` | `/api/profile` | Authenticated |
| `PUT` | `/api/profile` | Authenticated |
| `POST` | `/api/profile/avatar` | Authenticated |

API responses follow this shape:

```json
{
  "success": true,
  "data": {}
}
```

Errors follow this shape:

```json
{
  "success": false,
  "message": "Error message"
}
```

Validation errors include an `errors` object.

## Authentication

JWT is issued in an HTTP-only cookie for browser usage. The login and register API responses also include the JWT token so protected endpoints can be tested manually and remain aligned with the case-study JWT requirement.

Protected route helpers support both methods:

```txt
Authorization: Bearer <token>
```

and the existing HTTP-only auth cookie fallback. If both are present, the `Authorization` header takes priority. If an `Authorization` header is present but malformed, the request is rejected with `401` instead of falling back to the cookie.

Manual API example:

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Test Post",
    "content": "Hello from Markdown"
  }'
```

## Search and Pagination

The home page consumes:

```txt
GET /api/posts?page=1&limit=10&search=keyword
```

Behavior:

- Defaults to `page=1` and `limit=10`
- Uses a safe maximum limit
- Searches post `title` and `content`
- Preserves search while paginating
- Redirects out-of-range page numbers to the last valid page
- Shows empty states for no posts or no search results

## Markdown

Post content is stored as raw Markdown in `posts.content`.

Rendering happens in the application layer through `components/markdown-renderer.tsx`. The renderer supports:

- Headings
- Bold and italic text
- Links with safe protocols only
- Inline code
- Fenced code blocks
- Ordered and unordered lists
- Blockquotes
- Horizontal rules
- Pipe tables

Raw HTML is not injected into the page.

## Avatar Uploads

Profile avatars use local upload storage for this case-study implementation.

- Upload endpoint: `POST /api/profile/avatar`
- Form field: `avatar`
- Accepted types: JPEG, PNG, WebP
- Max size: 2MB
- Stored under: `public/uploads/avatars`
- Public URL format: `/uploads/avatars/{filename}`

This is intended for local development and review, not cloud production storage.

## Database Models

The Prisma schema defines:

- `User`
- `Post`
- `Comment`

Main relationships:

```txt
User has many Posts
User has many Comments
Post belongs to User
Post has many Comments
Comment belongs to Post
Comment belongs to User
```
