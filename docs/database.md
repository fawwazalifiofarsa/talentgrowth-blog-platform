# Database Design

The Talent Growth Blog Platform uses local PostgreSQL with Prisma ORM.

The main models are:

* `User`
* `Post`
* `Comment`

The database does not use a separate external auth user table. Authentication data lives in the `users` table, with the password stored only as a bcrypt hash. Next.js Route Handlers access the database through Prisma server-side helpers.

## Tables

```txt
users
posts
comments
```

## Entity Relationships

```txt
User
-> has many Posts
-> has many Comments

Post
-> belongs to User
-> has many Comments

Comment
-> belongs to Post
-> belongs to User
```

## users

| Field | Type | Required | Notes |
| --- | --- | ---: | --- |
| `id` | UUID | Yes | Primary key |
| `name` | Text | Yes | Display name |
| `email` | Text | Yes | Unique login email |
| `password_hash` | Text | Yes | bcrypt password hash |
| `avatar_url` | Text | No | Optional profile image URL |
| `avatar_path` | Text | No | Optional local/storage path |
| `created_at` | Timestamp | Yes | Created time |
| `updated_at` | Timestamp | Yes | Updated time |

Rules:

* `email` must be unique.
* Plain text passwords must never be stored.
* API responses must never return `password_hash`.

## posts

| Field | Type | Required | Notes |
| --- | --- | ---: | --- |
| `id` | UUID | Yes | Primary key |
| `title` | Text | Yes | Blog post title |
| `description` | Text | No | Short listing summary |
| `content` | Text | Yes | Raw Markdown content |
| `author_id` | UUID | Yes | References `users.id` |
| `created_at` | Timestamp | Yes | Created time |
| `updated_at` | Timestamp | Yes | Updated time |

Rules:

* `title` and `content` are required.
* `author_id` is used for ownership checks.
* Posts are ordered by newest first in the listing.

## comments

| Field | Type | Required | Notes |
| --- | --- | ---: | --- |
| `id` | UUID | Yes | Primary key |
| `content` | Text | Yes | Comment body |
| `post_id` | UUID | Yes | References `posts.id` |
| `author_id` | UUID | Yes | References `users.id` |
| `created_at` | Timestamp | Yes | Created time |
| `updated_at` | Timestamp | Yes | Updated time |

Rules:

* `content` is required.
* `author_id` is used for ownership checks.
* Deleting a post should delete related comments through cascade behavior.

## Prisma Schema

```prisma
model User {
  id           String    @id @default(uuid()) @db.Uuid
  name         String
  email        String    @unique
  passwordHash String    @map("password_hash")
  avatarUrl    String?   @map("avatar_url")
  avatarPath   String?   @map("avatar_path")
  posts        Post[]
  comments     Comment[]
  createdAt    DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt    DateTime  @updatedAt @map("updated_at") @db.Timestamptz(6)

  @@index([email])
  @@map("users")
}

model Post {
  id          String    @id @default(uuid()) @db.Uuid
  title       String
  description String?
  content     String
  authorId    String    @map("author_id") @db.Uuid
  author      User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments    Comment[]
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt   DateTime  @updatedAt @map("updated_at") @db.Timestamptz(6)

  @@index([authorId])
  @@index([createdAt])
  @@map("posts")
}

model Comment {
  id        String   @id @default(uuid()) @db.Uuid
  content   String
  postId    String   @map("post_id") @db.Uuid
  authorId  String   @map("author_id") @db.Uuid
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz(6)

  @@index([postId])
  @@index([authorId])
  @@index([createdAt])
  @@map("comments")
}
```

## Indexes

Recommended indexes:

* `users.email`
* `posts.author_id`
* `posts.created_at`
* `comments.post_id`
* `comments.author_id`
* `comments.created_at`

## Search

Search is handled by the posts listing endpoint.

Searchable fields:

* `title`
* `content`

Search should work with pagination and use case-insensitive matching where supported.

## Pagination

The posts listing accepts:

```txt
GET /api/posts?page=1&limit=10&search=nextjs
```

Defaults:

* `page`: `1`
* `limit`: `10`
* safe maximum limit: `50`

## Markdown

`posts.content` stores raw Markdown. Rendered HTML is not stored in the database.

## Avatar Metadata

Profile picture support may store:

* `avatar_url`
* `avatar_path`

File storage must not use removed providers. If avatar upload is implemented, it should use a Route Handler controlled local or replacement storage approach.

## Out of Scope

* Admin roles
* Likes
* Bookmarks
* Followers
* Notifications
* Analytics
* Draft scheduling
* Payments
* Teams or workspaces
