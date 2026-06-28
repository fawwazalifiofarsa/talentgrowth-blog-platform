# Roadmap

This roadmap tracks the Next.js App Router implementation for the Talent Growth Blog Platform.

## MVP Scope

* User registration, login, and logout
* JWT authentication
* bcrypt password hashing
* Blog post CRUD
* Comment CRUD
* Author-only edit and delete authorization
* Profile page with own posts
* Search by title and content
* Pagination
* Markdown writing and rendering
* Validation and error handling
* Responsive design
* Optional profile picture support

## Phase 1: Foundation

Goal: establish the local PostgreSQL and Route Handler backend foundation.

Tasks:

* Keep the default Next.js App Router project structure.
* Use `app/` for frontend pages and components.
* Use `app/api/` for backend Route Handlers.
* Configure Prisma for local PostgreSQL.
* Update Prisma models to `User`, `Post`, and `Comment`.
* Configure `.env.example`.
* Create reusable helpers in `lib/` for Prisma, JWT, password hashing, API responses, and validation.
* Keep Prisma usage out of client components.

Expected result:

* The app can run locally.
* API routes are served by Next.js Route Handlers.
* Prisma validates against the local PostgreSQL schema.
* Project docs match the architecture.

## Phase 2: Authentication

Goal: implement custom JWT authentication.

Tasks:

* Add `POST /api/auth/register`.
* Add `POST /api/auth/login`.
* Add `POST /api/auth/logout`.
* Hash passwords with bcrypt.
* Store only `password_hash`.
* Sign JWT access tokens.
* Add server-side JWT verification helpers.
* Add frontend token handling.

Expected result:

* Users can register, log in, log out, and make protected requests.

## Phase 3: Posts

Goal: implement blog post CRUD across API routes and frontend.

Tasks:

* Add `GET /api/posts` with search, pagination, and newest-first ordering.
* Add `POST /api/posts`.
* Add `GET /api/posts/[id]`.
* Add `PUT /api/posts/[id]`.
* Add `DELETE /api/posts/[id]`.
* Include author info in post responses.
* Enforce post author ownership for update and delete.
* Update frontend listing, detail, create, edit, and delete flows.

Expected result:

* Public users can read posts.
* Authenticated users can create posts.
* Authors can edit and delete only their own posts.

## Phase 4: Comments

Goal: implement comment CRUD across API routes and frontend.

Tasks:

* Add `GET /api/posts/[id]/comments`.
* Add `POST /api/posts/[id]/comments`.
* Add `PUT /api/comments/[id]`.
* Add `DELETE /api/comments/[id]`.
* Include author info in comment responses.
* Enforce comment author ownership for update and delete.
* Add frontend comment section and forms.

Expected result:

* Public users can read comments.
* Authenticated users can create comments.
* Authors can edit and delete only their own comments.

## Phase 5: Profile

Goal: implement profile data from the local user model.

Tasks:

* Add `GET /api/profile`.
* Add `PUT /api/profile` if needed by the UI.
* Return safe user data and own posts.
* Add profile page integration.
* Add profile picture support later if included.

Expected result:

* Authenticated users can view their profile and their own posts.

## Phase 6: Polish

Goal: complete plus-point and usability requirements.

Tasks:

* Refine search behavior.
* Refine pagination UI.
* Add Markdown rendering and styling.
* Improve validation messages.
* Improve loading, error, and empty states.
* Verify responsive layouts.
* Manually test main flows.

Expected result:

* The platform is stable, focused, and ready for case-study review.

## Out of Scope

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
* Teams or workspaces
* Payments
* Deployment automation
* Git automation
