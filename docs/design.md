# Design

This document mirrors the product design direction in the root `DESIGN.md` file.

The UI remains focused on the required blog platform pages and account screens:

* Home page
* Post detail page
* Create post page
* Edit post page
* Login page
* Register page
* Profile page
* Protected change password page or profile account section

Technical references should use the current architecture:

* Frontend pages and components are built with Next.js and React.
* Backend behavior is implemented with Next.js Route Handlers under `app/api`.
* Authentication uses custom JWT tokens and bcrypt password hashing.
* Protected requests send `Authorization: Bearer <token>`.
* Prisma is used only on the server side.
* PostgreSQL is the local database.

The design should stay simple, readable, responsive, and focused on the case-study requirements.

Do not include public forgot-password or reset-password pages or links. Password changes belong inside the authenticated profile/account area and should include current password, new password, submit button, loading state, validation errors, API error message, and success message. Do not add admin, social, analytics, team, payment, or other out-of-scope UI.

