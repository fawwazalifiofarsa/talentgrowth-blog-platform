# Design

This document describes the product and interface design plan for the Talent Growth Blog Platform.

The goal is to create a clean, simple, and usable blog platform that focuses on the required core functionality without overbuilding unnecessary features.

## Design Goals

The application should feel:

* Simple
* Clear
* Responsive
* Easy to navigate
* Comfortable for reading blog content
* Fast enough for common blog actions
* Friendly for both public users and authenticated users

The design should prioritize functionality over visual complexity.

## Core Pages

The application includes the following main pages:

```txt id="eui5hs"
Home page
Post detail page
Create post page
Edit post page
Login page
Register page
Profile page
```

## 1. Home Page

The home page displays the list of blog posts.

## Purpose

The home page helps users discover and browse blog posts.

## Main Content

The page should include:

* Page title
* Search input
* Blog post list
* Pagination controls
* Create post button for authenticated users
* Empty state when no posts are available
* Empty state when no search results are found

## Blog Post Card

Each blog post card should display:

* Post title
* Short description
* Author name
* Author avatar if available
* Publication date
* Read more link

## User Behavior

Public users can:

* View blog posts
* Search blog posts
* Use pagination
* Open post detail pages

Authenticated users can also:

* Create a new blog post
* Access their profile page

## Empty States

When there are no posts:

```txt id="5sg9ii"
No posts yet.
```

When a search returns no result:

```txt id="0zbii6"
No posts found for this search.
```

## 2. Post Detail Page

The post detail page displays the full blog post and its comments.

## Purpose

The post detail page allows users to read the full post, view comments, and interact with the content if they are authenticated.

## Main Content

The page should include:

* Post title
* Post description if available
* Author information
* Publication date
* Updated date if useful
* Rendered Markdown content
* Comments section
* Comment form for authenticated users

## Author Actions

If the current user is the post author, show:

* Edit post button
* Delete post button

If the current user is not the post author, hide these actions.

The server must still enforce authorization even if the buttons are hidden.

## Comment Section

Each comment should display:

* Comment content
* Comment author name
* Comment author avatar if available
* Created date
* Edit and delete buttons if the current user is the comment author

## Public User Behavior

Public users can:

* Read the post
* View comments

Public users cannot:

* Add comments
* Edit posts
* Delete posts
* Edit comments
* Delete comments

If a public user wants to comment, the UI can show a simple login prompt.

Example:

```txt id="3iw27y"
Log in to join the discussion.
```

## 3. Create Post Page

The create post page allows authenticated users to create a new blog post.

## Purpose

This page provides a simple writing form for new blog content.

## Form Fields

The form should include:

* Title
* Description
* Content

## Field Rules

| Field       | Required | Notes                          |
| ----------- | -------: | ------------------------------ |
| Title       |      Yes | Main blog post title           |
| Description |       No | Short summary for listing page |
| Content     |      Yes | Markdown-supported post body   |

## Main Actions

The page should include:

* Create/Publish button
* Cancel or back button
* Validation messages
* Loading state during submission

## Validation Messages

Example validation messages:

```txt id="n8mxz1"
Title is required.
Content is required.
```

## Markdown Writing

The content field should support Markdown input.

The first version can use a simple textarea.

A complex rich text editor is intentionally not required.

## 4. Edit Post Page

The edit post page allows post authors to update their own blog posts.

## Purpose

This page lets authors revise existing content.

## Form Behavior

The form should be pre-filled with:

* Existing title
* Existing description
* Existing content

## Main Actions

The page should include:

* Save changes button
* Cancel or back button
* Validation messages
* Loading state during submission

## Authorization Behavior

Only the post author should be able to access or submit the edit form.

If a non-author tries to access the page, the UI should show an error or redirect them safely.

The server must still reject unauthorized update requests.

## 5. Login Page

The login page allows registered users to access their account.

## Purpose

This page lets users authenticate so they can create posts, comment, and manage their profile.

## Form Fields

The form should include:

* Email
* Password

## Main Actions

The page should include:

* Login button
* Link to register page
* Error message area

## Validation Messages

Example messages:

```txt id="1cd7re"
Email is required.
Password is required.
Invalid email or password.
```

## 6. Register Page

The register page allows new users to create an account.

## Purpose

This page lets users create a new account and profile.

## Form Fields

The form should include:

* Name
* Email
* Password

## Main Actions

The page should include:

* Register button
* Link to login page
* Error message area

## Validation Messages

Example messages:

```txt id="1n7rmd"
Name is required.
Email is required.
Please enter a valid email address.
Password is required.
An account with this email already exists.
```

## 7. Profile Page

The profile page displays the authenticated user's profile and their own posts.

## Purpose

This page gives users a simple place to view their account information and content.

## Main Content

The page should include:

* Profile picture
* Name
* Email
* Upload/change profile picture action
* List of user's own posts

## Own Posts List

Each post item should display:

* Title
* Description
* Created date
* Link to view post
* Link to edit post if useful

## Avatar Upload

The avatar upload area should:

* Accept image files only
* Show the current profile picture
* Show upload progress or loading state
* Show error message for invalid files
* Update the displayed avatar after successful upload

## Navigation Design

The navigation should be simple and consistent.

## Public Navigation

Public users should see:

* Home
* Login
* Register

## Authenticated Navigation

Authenticated users should see:

* Home
* Create Post
* Profile
* Logout

## Responsive Navigation

On smaller screens, navigation can collapse into a simple menu if needed.

The first version can keep navigation simple as long as it remains usable on mobile.

## Main User Flows

## Register Flow

```txt id="00v7xj"
User opens register page
→ Enters name, email, and password
→ Submits form
→ /api/auth/register validates input
→ Password is hashed with bcrypt
→ Application creates user
→ JWT token is returned
→ User can log in or continue as authenticated user
```

## Login Flow

```txt id="1q6zru"
User opens login page
→ Enters email and password
→ Submits form
→ /api/auth/login validates credentials
→ Password is verified with bcrypt
→ JWT token is returned
→ User becomes authenticated
→ User can access protected actions
```

## Create Post Flow

```txt id="cnry39"
Authenticated user opens create post page
→ Enters title and content
→ Optionally enters description
→ Submits form
→ Server validates input
→ Server creates post
→ User is taken to the post detail page or post list
```

## Edit Post Flow

```txt id="z9k5c6"
Post author opens edit post page
→ Form loads existing post data
→ Author updates content
→ Submits form
→ Server validates ownership and input
→ Server updates post
→ User is taken back to the post detail page
```

## Delete Post Flow

```txt id="tpad3l"
Post author clicks delete
→ UI asks for confirmation
→ Server validates ownership
→ Server deletes post
→ User is taken back to the post list
```

## Comment Flow

```txt id="s00x39"
Authenticated user opens post detail page
→ Writes comment
→ Submits comment
→ Server validates input
→ Comment appears in the comment section
```

## Search Flow

```txt id="25v8as"
User enters search keyword on home page
→ Application fetches matching posts
→ Matching posts are displayed
→ Empty state is shown if no posts match
```

## Pagination Flow

```txt id="0xn95g"
User opens post list
→ Application shows limited posts per page
→ User clicks next or previous page
→ Application fetches posts for selected page
```

## Markdown Flow

```txt id="0qg0v1"
User writes Markdown in post content field
→ Raw Markdown is saved in the database
→ Post detail page renders Markdown into readable content
```

## UI States

Every main page should handle common UI states.

## Loading State

Use loading states when:

* Fetching posts
* Fetching post detail
* Fetching profile
* Submitting forms
* Uploading avatar

Example:

```txt id="hwn8vr"
Loading...
```

## Error State

Use error states when:

* A request fails
* A post is not found
* A profile is not found
* The user is unauthorized
* A validation error occurs

Example:

```txt id="u7rph9"
Something went wrong. Please try again.
```

## Empty State

Use empty states when:

* No posts exist
* No search results exist
* A profile has no posts yet
* A post has no comments yet

Example:

```txt id="agpboq"
No comments yet. Be the first to comment.
```

## Confirmation State

Use confirmation before destructive actions.

Destructive actions:

* Delete post
* Delete comment

Example:

```txt id="xbmlv8"
Are you sure you want to delete this?
```

## Form Design

Forms should be simple and readable.

Each form should include:

* Clear label
* Input field
* Validation message
* Submit button
* Loading state
* Error message area

Form buttons should clearly describe the action.

Examples:

```txt id="f7a7ti"
Create Post
Save Changes
Add Comment
Upload Picture
Login
Register
```

## Content Design

The platform should be comfortable for reading blog posts.

Post content should have:

* Clear heading style
* Good line height
* Enough spacing between paragraphs
* Readable font size
* Styled links
* Styled code blocks
* Styled lists
* Responsive width

Markdown-rendered content should not feel cramped on mobile.

## Responsive Design

The application should support:

* Desktop
* Tablet
* Mobile

## Desktop

Desktop layout can use:

* Wider content container
* Horizontal navigation
* Larger spacing
* Multi-column layout only if useful

## Tablet

Tablet layout should:

* Keep content readable
* Avoid overly wide forms
* Maintain comfortable spacing

## Mobile

Mobile layout should:

* Use single-column layout
* Keep buttons easy to tap
* Keep forms full-width
* Avoid horizontal scrolling
* Keep blog content readable
* Keep navigation simple

## Accessibility Considerations

The design should include basic accessibility practices.

Recommended practices:

* Use semantic HTML where possible
* Use labels for form inputs
* Use buttons for actions
* Use links for navigation
* Keep text readable
* Provide visible validation messages
* Avoid relying only on color to show errors
* Ensure interactive elements are keyboard accessible

## Visual Style Direction

The visual style should be clean and minimal.

Recommended style:

* Neutral background
* Clear content cards
* Simple border and spacing
* Readable typography
* Consistent button styling
* Clear form inputs
* Subtle hover states
* No unnecessary animation

The design should not distract from the main purpose: reading and writing blog posts.

## Component Plan

Useful reusable components include:

```txt id="f7e9y7"
Navbar
PostCard
PostList
SearchInput
Pagination
PostForm
CommentList
CommentItem
CommentForm
ProfileCard
AvatarUpload
MarkdownRenderer
LoadingState
ErrorState
EmptyState
ConfirmDialog
```

These components should stay simple and focused.

## Authorization in UI

The UI should reflect the current user's permissions.

Examples:

* Hide create post button when the user is not logged in.
* Hide edit/delete post buttons when the user is not the post author.
* Hide comment form when the user is not logged in.
* Hide edit/delete comment buttons when the user is not the comment author.
* Show profile link only when the user is logged in.

Important note:

```txt id="aw6plg"
UI authorization is only for user experience.
Server-side authorization is still required.
```

## Out of Scope Design

The design intentionally excludes:

* Admin dashboard
* Complex landing page
* Marketing pages
* User follow system
* Likes and bookmarks
* Notification center
* Analytics dashboard
* Team workspace UI
* Content moderation dashboard
* Rich text editor
* Complex theme system
* Advanced animation

## Design Completion Checklist

The design is complete when:

* Home page displays posts clearly.
* Search input is easy to find.
* Pagination is easy to use.
* Post cards show important post information.
* Post detail page displays Markdown content clearly.
* Comments are readable and easy to manage.
* Create post form is simple and validated.
* Edit post form is pre-filled and validated.
* Login form is simple and clear.
* Register form is simple and clear.
* Profile page shows user info and own posts.
* Avatar upload is understandable.
* Loading states are handled.
* Error states are handled.
* Empty states are handled.
* Delete actions ask for confirmation.
* Layout works on desktop.
* Layout works on tablet.
* Layout works on mobile.
* UI does not include unnecessary features outside the project scope.
