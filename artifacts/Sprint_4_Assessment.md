# Sprint 4 Assessment Submission — Community Languages: Teach and Learn

---

## 1. Sprint 4 Overview

Sprint 4 focused on completing the Minimum Viable Product (MVP) by adding intermediate and advanced features on top of the Sprint 3 foundation. The goal was to transform the basic CRUD application into a fully-featured, community-driven platform with user authentication, a points system, intelligent matching, community engagement tools, and CI/CD workflows.

---

## 2. Features Implemented

### 2.1 User Login (Authentication System)

> **Requirement:** User login

**What we built:**
A complete session-based authentication system with secure registration, login, and logout functionality.

**How it works:**
- **Registration** (`GET/POST /register`) — Users fill out a form with their name, email, password, role (Teacher or Learner), bio, spoken languages, learning interests, and community location. The password is hashed using `bcrypt` with 10 salt rounds before being stored in the database. After registration, the user is automatically logged in and redirected to their dashboard.
- **Login** (`GET/POST /login`) — Users enter their email and password. The system retrieves the user record and uses `bcrypt.compare()` to verify the password against the stored hash. On success, a session is created storing the user's `id`, `name`, `email`, `role`, and `points` (password hash is never stored in the session).
- **Logout** (`POST /logout`) — Destroys the session using `req.session.destroy()` and redirects to the home page.
- **Route Protection** — The `middleware/auth.js` file exports three middleware functions:
  - `isAuthenticated` — Redirects unauthenticated users to `/login` with a flash message
  - `isTeacher` — Ensures only teachers can access lesson creation/editing
  - `isAdmin` — Ensures only admins can access admin-only routes

**How it meets the requirement:**
Users can register with distinct roles (learner/teacher), log in securely, and access role-specific dashboards. Protected routes ensure only authenticated users can create lessons, post on forums, or access dashboards.

**Key files:**
| File | Purpose |
|------|---------|
| `routes/authRoutes.js` | Registration, login, logout routes |
| `middleware/auth.js` | `isAuthenticated`, `isTeacher`, `isAdmin` middleware |
| `views/auth/register.pug` | Registration form |
| `views/auth/login.pug` | Login form |
| `config/db.js` | MySQL connection pool |

**Security considerations:**
- Passwords are hashed with `bcrypt` (10 rounds) — never stored in plain text
- Password hash is excluded from session data
- Password hash is explicitly deleted before rendering on user profile pages
- Duplicate email registration is prevented at application level and by `UNIQUE` constraint in the database
- Minimum password length of 6 characters is enforced
- Sessions are configured with 24-hour expiry
- `connect-flash` provides user-friendly error and success messages

---

### 2.2 User Points System

> **Requirement:** User points or ratings

**What we built:**
A comprehensive points-based gamification system that rewards users for contributing to the community.

**How it works:**
Points are awarded automatically when users perform positive community actions. The `users` table has a `points INT DEFAULT 0` column that is updated using `UPDATE users SET points = points + N WHERE id = ?` queries.

| Action | Points Awarded | Code Location |
|--------|---------------|---------------|
| Create a lesson (Teacher) | +10 points | `lessonRoutes.js` line 81 |
| Complete a lesson (Learner) | +5 points | `lessonRoutes.js` line 213 |
| Complete a quiz | +5 points | `lessonRoutes.js` line 236 |
| Create a forum post | +3 points | `forumRoutes.js` line 64 |
| Add a forum comment | +3 points | `forumRoutes.js` line 114 |

**Where points are displayed:**
- User profile page — Community Points stat card
- Teacher dashboard — Points Earned stat
- Learner dashboard — Points Earned stat
- Users list page — Users are sorted by points descending (`ORDER BY points DESC`)

**How the session stays in sync:**
After any point-awarding action, the session is immediately updated: `req.session.user.points = (req.session.user.points || 0) + N`. On the dashboard, points are refreshed from the database to ensure accuracy: `SELECT points FROM users WHERE id = ?`.

**How it meets the requirement:**
The system provides a clear, transparent points economy that incentivises users to teach, learn, and engage with the community — directly supporting the theme of "Sharing, exchange and building community."

---

### 2.3 Advanced Matching Algorithm / Recommendations

> **Requirement:** Basic matching algorithm / Advanced matching algorithm / recommendations

**What we built:**
A two-way intelligent matching system that connects Learners with Teachers (and vice versa) based on language overlap, plus a lesson recommendation engine.

**How the Matching Algorithm works:**

#### Learner Dashboard — "Recommended Study Buddies"
1. The system retrieves the current learner's `learning_interests` from the database
2. The interests string is split by comma into an array (e.g. `"Hindi, Arabic, Yoruba"` → `["Hindi", "Arabic", "Yoruba"]`)
3. A dynamic SQL query is built to find Teachers whose `spoken_languages` contain any of the learner's interests using `LIKE` matching:
   ```sql
   SELECT id, name, bio, spoken_languages, points
   FROM users
   WHERE role = 'teacher' AND (spoken_languages LIKE '%Hindi%' OR spoken_languages LIKE '%Arabic%' OR spoken_languages LIKE '%Yoruba%')
   ORDER BY points DESC LIMIT 6
   ```
4. Results are ranked by community points (most active teachers first)
5. Displayed as visually-styled profile cards with DiceBear avatars and "View Profile" links

#### Teacher Dashboard — "Learners Looking for Your Skills"
1. The system retrieves the current teacher's `spoken_languages`
2. A dynamic SQL query finds Learners whose `learning_interests` overlap with the teacher's spoken languages
3. Results are sorted by community points and limited to 6

#### Learner Dashboard — "Recommended Lessons"
1. In addition to matching users, the learner dashboard also recommends **lessons** that match the learner's interests
2. The query finds lessons in languages matching the learner's `learning_interests` that they have **not yet completed** (filtered using `NOT IN (SELECT lesson_id FROM lesson_progress WHERE learner_id = ?)`)
3. Displayed as lesson cards with language and difficulty badges

**How it meets the requirement:**
This goes beyond basic matching by implementing a **two-way** algorithm — both learners AND teachers receive personalised recommendations. The algorithm considers multiple language interests simultaneously and ranks results by community contribution. This directly supports the project theme by facilitating connections between people who can help each other learn.

**Key file:** `routes/dashboardRoutes.js`

---

### 2.4 In-App Messaging (Community Forum)

> **Requirement:** In-app messaging

**What we built:**
A full-featured community forum where users can create discussion posts and reply with comments, organised by language.

**How it works:**
- **Forum listing** (`GET /forum`) — Shows all forum posts with author name, language tag, comment count, and timestamps. Supports search and language filtering.
- **Create post** (`GET/POST /forum/create`) — Authenticated users can create a new post with a title, optional language tag, and body text. Awards +3 points.
- **Post detail** (`GET /forum/:id`) — Shows the full post body with all comments in chronological order. Each comment shows the author name and timestamp.
- **Add comment** (`POST /forum/:id/comment`) — Authenticated users can add comments to any post. Awards +3 points.

**Database tables used:**
- `forum_posts` — Stores posts with `user_id`, `language_id`, `title`, `body`, and `created_at`
- `forum_comments` — Stores comments with `post_id`, `user_id`, `body`, and `created_at`

**How it meets the requirement:**
The forum provides a persistent, public communication channel for the community. Users can ask questions about specific languages, share resources, and help each other — directly supporting the theme of community building and mutual support. The language tagging system makes it easy to find language-specific discussions.

**Key files:**
| File | Purpose |
|------|---------|
| `routes/forumRoutes.js` | Forum CRUD routes and comment handling |
| `views/forum/index.pug` | Forum listing with search and language filter |
| `views/forum/create.pug` | New post creation form |
| `views/forum/detail.pug` | Post detail with comments thread |

---

### 2.5 External API Integration (DiceBear Avatars)

> **Requirement:** Use of external APIs where relevant

**What we built:**
Integration with the **DiceBear API** (https://api.dicebear.com) to dynamically generate unique, colourful profile avatars for every user based on their name.

**How it works:**
Instead of displaying plain text initials, the application generates an `<img>` tag pointing to the DiceBear API:
```
https://api.dicebear.com/7.x/initials/svg?seed={userName}&backgroundColor=00897b,00acc1,039be5&textColor=ffffff
```

**Parameters used:**
| Parameter | Value | Purpose |
|-----------|-------|---------|
| Style | `initials` | Generates stylised letter avatars |
| `seed` | User's name | Ensures the same user always gets the same avatar |
| `backgroundColor` | `00897b,00acc1,039be5` | Teal/cyan colour palette matching the app's design |
| `textColor` | `ffffff` | White text for readability |
| Format | `svg` | Scalable vector graphics for crisp rendering at any size |

**Where it is used:**
- User profile page (`views/users/profile.pug`) — Large avatar in the profile header
- Community members listing (`views/users/index.pug`) — Medium avatar on each user card
- Learner dashboard (`views/dashboard/learner.pug`) — Avatars on recommended teacher cards
- Teacher dashboard (`views/dashboard/teacher.pug`) — Avatars on recommended learner cards

**How it meets the requirement:**
The DiceBear API is a genuine external REST API that enhances the user experience. Each user gets a unique, deterministic avatar without needing to upload an image, which reduces friction for new users and gives the application a polished, professional appearance.

---

### 2.6 Full Lesson CRUD Operations

> **Additional feature beyond the base checklist**

Teachers have complete control over their lesson content:

| Operation | Route | Description |
|-----------|-------|-------------|
| **Create** | `GET/POST /lessons/create` | Form with title, language, category, difficulty, description, content, vocabulary, media URL, and tags |
| **Read** | `GET /lessons/:id` | Full lesson detail with all content, tags, quiz, and progress tracking |
| **Update** | `GET/POST /lessons/:id/edit` | Edit form pre-populated with existing data. **Owner-only** — checks `lesson.teacher_id === req.session.user.id` |
| **Delete** | `POST /lessons/:id/delete` | Delete with **owner-only** protection |

---

### 2.7 Quiz System

> **Additional feature beyond the base checklist**

- Each lesson can have multiple-choice quiz questions stored in `quiz_questions`
- Questions have 4 options (A/B/C/D) with a correct answer
- Learners submit answers via `POST /lessons/:id/quiz`
- The server compares each answer against the correct option and calculates a score
- Results are stored in `quiz_attempts` with `score`, `total_questions`, and `attempted_at`
- +5 points awarded for completing a quiz

---

## 3. DevOps and CI/CD

### 3.1 Application Runs in Docker Containers

> **Requirement:** Application runs in Docker containers

**What we built:**
A fully containerised development and deployment environment using Docker and Docker Compose with two services.

**Dockerfile** (Node.js Application):
```dockerfile
FROM node:18-alpine        # Lightweight Alpine base image
WORKDIR /app               # Set working directory
COPY package*.json ./      # Copy package files first (for caching)
RUN npm ci --production    # Install production dependencies
COPY . .                   # Copy application code
EXPOSE 3000                # Expose application port
CMD ["node", "app.js"]     # Start the application
```

**Docker Compose** (`docker-compose.yml`):
| Service | Container Name | Image | Port Mapping | Purpose |
|---------|---------------|-------|-------------|---------|
| `mysql` | `cl-mysql` | `mysql:8` | `3307:3306` | MySQL 8 database with auto-initialisation |
| `app` | `cl-app` | Built from `Dockerfile` | `3000:3000` | Node.js Express application |

**Key Docker features:**
- **Database auto-initialisation:** `schema.sql` and `seed.sql` are mounted to `/docker-entrypoint-initdb.d/` with numbered prefixes (`01-schema.sql`, `02-seed.sql`) to ensure correct execution order
- **Persistent data:** MySQL data is stored in a named Docker volume (`mysql_data`)
- **Environment variables:** Database credentials and session secret are passed via `environment` in compose
- **Service dependency:** `depends_on: mysql` ensures the database starts before the application
- **Restart policy:** `unless-stopped` ensures containers auto-restart on failure

**How to run:**
```bash
docker-compose up --build
```
Then visit `http://localhost:3000`

---

### 3.2 GitHub Actions CI/CD Pipeline

> **Requirement:** At least one GitHub action implemented

**What we built:**
A continuous integration pipeline that runs automatically on every push and pull request to the `main` branch.

**Pipeline file:** `.github/workflows/ci.yml`

**Pipeline steps:**

| Step | Action | Purpose |
|------|--------|---------|
| 1. Checkout | `actions/checkout@v4` | Clones the repository code |
| 2. Setup Node | `actions/setup-node@v4` (Node 18) | Installs the correct Node.js version |
| 3. Install Dependencies | `npm ci` | Clean install of all dependencies from lockfile |
| 4. Syntax Check | `npm run check` | Runs `node --check app.js` to verify there are no syntax errors |
| 5. Docker Build | `docker build -t community-languages .` | Verifies the Docker image builds successfully |

**Triggers:**
- Push to `main` branch
- Pull requests targeting `main` branch

**How it meets the requirement:**
The pipeline ensures code quality by automatically validating syntax and Docker builds on every commit. If any step fails, the team is notified immediately through GitHub, preventing broken code from being merged.

---

## 4. Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                        │
│  ┌─────────────────────┐   ┌──────────────────────────┐ │
│  │     cl-mysql         │   │        cl-app             │ │
│  │   MySQL 8 Database   │◄──│   Node.js + Express       │ │
│  │                      │   │                            │ │
│  │  ┌────────────────┐  │   │  ┌──────────────────────┐ │ │
│  │  │ users          │  │   │  │ app.js (entry point)  │ │ │
│  │  │ lessons        │  │   │  │                        │ │ │
│  │  │ languages      │  │   │  │ Routes:                │ │ │
│  │  │ categories     │  │   │  │  ├─ indexRoutes.js     │ │ │
│  │  │ tags           │  │   │  │  ├─ authRoutes.js      │ │ │
│  │  │ lesson_tags    │  │   │  │  ├─ userRoutes.js      │ │ │
│  │  │ lesson_progress│  │   │  │  ├─ lessonRoutes.js    │ │ │
│  │  │ quiz_questions │  │   │  │  ├─ categoryRoutes.js  │ │ │
│  │  │ quiz_attempts  │  │   │  │  ├─ dashboardRoutes.js │ │ │
│  │  │ forum_posts    │  │   │  │  └─ forumRoutes.js     │ │ │
│  │  │ forum_comments │  │   │  │                        │ │ │
│  │  └────────────────┘  │   │  │ Views (PUG):           │ │ │
│  │                      │   │  │  ├─ layout.pug         │ │ │
│  │  Port: 3307:3306     │   │  │  ├─ index/about/error  │ │ │
│  └─────────────────────┘   │  │  ├─ auth/ (login, reg) │ │ │
│                             │  │  ├─ users/ (list, prof)│ │ │
│                             │  │  ├─ lessons/ (CRUD)    │ │ │
│                             │  │  ├─ categories/        │ │ │
│                             │  │  ├─ dashboard/ (T & L) │ │ │
│                             │  │  └─ forum/ (posts, cmt)│ │ │
│                             │  └──────────────────────┘ │ │
│                             │   Port: 3000:3000          │ │
│                             └──────────────────────────┘ │
│                                                           │
│  External API: DiceBear (api.dicebear.com)               │
└─────────────────────────────────────────────────────────┘

         ┌─────────────────────────────────────┐
         │        GitHub Actions CI            │
         │  ┌──────┐ ┌──────┐ ┌─────────────┐ │
         │  │Syntax│→│ npm  │→│Docker Build  │ │
         │  │Check │ │  ci  │ │   Test       │ │
         │  └──────┘ └──────┘ └─────────────┘ │
         └─────────────────────────────────────┘
```

---

## 5. Sprint 4 Requirements Checklist

| Requirement | Status | Implementation |
|-------------|--------|---------------|
| User login | ✅ Implemented | bcrypt authentication with express-session, register/login/logout flows |
| Basic matching algorithm | ✅ Implemented | Lesson recommendations based on `learning_interests` vs `language.name` |
| User points or ratings | ✅ Implemented | Points awarded for creating lessons (+10), completing lessons (+5), quizzes (+5), forum posts (+3), comments (+3) |
| Advanced ratings or points system | ✅ Implemented | Multi-action points economy with leaderboard ranking on user list page |
| In-app messaging | ✅ Implemented | Community forum with posts, comments, language tagging, search filtering |
| Advanced matching algorithm / recommendations | ✅ Implemented | Two-way user matching (learner↔teacher) based on `spoken_languages` vs `learning_interests`, ranked by points |
| Use of external APIs | ✅ Implemented | DiceBear API for dynamic avatar generation across all user-facing pages |
| Application runs in Docker containers | ✅ Implemented | Two-service Docker Compose with MySQL 8 and Node.js Alpine |
| At least one GitHub Action implemented | ✅ Implemented | CI pipeline with syntax check + Docker build on push/PR to main |

---

## 6. Meeting the Module Theme

> **Theme:** "Sharing, exchange and building community"

Our application — **Community Languages: Teach and Learn** — directly addresses this theme by creating a platform where:

1. **Sharing:** Teachers share their language expertise by creating detailed lessons with vocabulary, cultural context, and quizzes. Knowledge is shared freely — there is no financial transaction.

2. **Exchange:** The matching algorithm connects people who can teach what others want to learn, creating a mutual exchange. A Yoruba speaker who wants to learn Hindi is matched with a Hindi speaker, and vice versa.

3. **Building Community:** The forum enables peer support, the points system rewards contribution, and the community members page helps people discover and connect with each other. The application specifically focuses on community languages — languages spoken by minority communities in the UK that are at risk of being lost.

**Ethical considerations addressed:**
- Password security (bcrypt hashing, no plain text storage)
- Data privacy (password hashes excluded from session and public profiles)
- Inclusive design (supports 10 community languages, accessible UI)
- Community moderation (role-based access control)
- No financial transactions — purely co-operative exchange

---

*GitHub repository: https://github.com/Saksen10/community-languages*

*Screenshots of the Kanban board and GitHub contributor metrics to be appended below.*
