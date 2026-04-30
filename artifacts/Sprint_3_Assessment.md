# Sprint 3 Assessment Submission — Community Languages: Teach and Learn

---

## 1. User Stories Implemented in Sprint 3

The following user stories were implemented during Sprint 3. Each story describes a feature from the perspective of the end user and maps directly to the assessment checklist requirements.

### US-01: Users List Page
> **As a** visitor, **I want to** browse a list of all community members, **so that I can** find teachers and fellow learners to connect with.

**Implementation:**
- **Route:** `GET /users` — [userRoutes.js](../routes/userRoutes.js)
- **View:** [views/users/index.pug](../views/users/index.pug)
- **Database:** Pulls all users from the `users` table with `SELECT * FROM users`
- **Features delivered:**
  - Displays all registered users as visually styled cards with DiceBear API avatars
  - Supports **search filtering** by name or bio
  - Supports **role filtering** (Teacher / Learner dropdown)
  - Supports **language filtering** by spoken or learning languages
  - Results are sorted by community points (descending), then name (ascending)

---

### US-02: User Profile Page
> **As a** visitor, **I want to** view a detailed profile for any member, **so that I can** learn about their languages, teaching experience, and community contributions.

**Implementation:**
- **Route:** `GET /users/:id` — [userRoutes.js](../routes/userRoutes.js)
- **View:** [views/users/profile.pug](../views/users/profile.pug)
- **Database:** Fetches user by ID, plus their created lessons (if teacher) or completed lessons (if learner)
- **Features delivered:**
  - Profile header with DiceBear API avatar, name, role badge (Teacher/Learner), join date
  - Displays spoken languages and learning interests from the database
  - Community points display
  - **Teachers:** Shows a grid of all lessons they have created
  - **Learners:** Shows a grid of all lessons they have completed with completion dates
  - Sidebar with user bio
  - Password hash is explicitly deleted before rendering for **security**

---

### US-03: Listing Page (Browse Lessons)
> **As a** learner, **I want to** browse available lessons with filters, **so that I can** find lessons matching my interests and skill level.

**Implementation:**
- **Route:** `GET /lessons` — [lessonRoutes.js](../routes/lessonRoutes.js)
- **View:** [views/lessons/index.pug](../views/lessons/index.pug)
- **Database:** Joins `lessons`, `users`, `languages`, and `categories` tables
- **Features delivered:**
  - Full listing of all lessons with teacher name, language, category, and difficulty
  - **Search filter** by title or description
  - **Language filter** dropdown (populated from `languages` table)
  - **Category filter** dropdown (populated from `categories` table)
  - **Difficulty filter** (beginner / intermediate / advanced)
  - Lessons sorted by most recently created

---

### US-04: Detail Page (Lesson Detail)
> **As a** learner, **I want to** view the full content of a lesson, including vocabulary and quizzes, **so that I can** learn from the lesson material and test my knowledge.

**Implementation:**
- **Route:** `GET /lessons/:id` — [lessonRoutes.js](../routes/lessonRoutes.js)
- **View:** [views/lessons/detail.pug](../views/lessons/detail.pug)
- **Database:** Joins `lessons`, `users`, `languages`, `categories` tables; also loads `tags`, `quiz_questions`, `lesson_progress`, and `quiz_attempts`
- **Features delivered:**
  - Full lesson content with teacher attribution
  - Language badge, category badge, difficulty badge
  - Vocabulary section
  - Tags displayed from the `lesson_tags` join table
  - Interactive quiz section with multiple-choice questions (A/B/C/D)
  - "Mark as Complete" button for learners (inserts into `lesson_progress`)
  - Quiz result display (score out of total)
  - Points awarded: +5 for completing a lesson, +5 for completing a quiz

---

### US-05: Tags/Categories
> **As a** visitor, **I want to** browse all available languages, categories, and tags, **so that I can** discover what the platform offers and find relevant content.

**Implementation:**
- **Route:** `GET /categories` — [categoryRoutes.js](../routes/categoryRoutes.js)
- **View:** [views/categories/index.pug](../views/categories/index.pug)
- **Database:** Aggregates `languages`, `categories`, and `tags` tables with lesson counts
- **Features delivered:**
  - Languages section with lesson counts (from `LEFT JOIN lessons`)
  - Categories section with lesson counts (from `LEFT JOIN lessons`)
  - Tags listing (from `tags` table)

---

## 2. Database Design

### Entity Relationship Overview

The database consists of **10 tables** with carefully designed relationships:

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   users     │       │   lessons    │       │  languages  │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ id (PK)     │◄──┐   │ id (PK)      │   ┌──►│ id (PK)     │
│ name        │   │   │ teacher_id(FK)│───┘   │ name        │
│ email (UQ)  │   │   │ language_id   │───────│ description │
│ password    │   │   │ category_id   │──┐    └─────────────┘
│ role (ENUM) │   │   │ title         │  │
│ bio         │   │   │ description   │  │    ┌─────────────┐
│ spoken_lang │   │   │ content       │  └───►│ categories  │
│ learn_inter │   │   │ vocabulary    │       ├─────────────┤
│ location    │   │   │ media_url     │       │ id (PK)     │
│ points      │   │   │ difficulty    │       │ name        │
│ created_at  │   │   │ created_at    │       │ description │
└─────────────┘   │   │ updated_at    │       └─────────────┘
                  │   └──────────────┘
                  │          │
        ┌─────────┤          ├──────────────┐
        │         │          │              │
┌───────▼───────┐ │  ┌───────▼────────┐  ┌──▼──────────┐
│lesson_progress│ │  │ quiz_questions  │  │ lesson_tags │
├───────────────┤ │  ├────────────────┤  ├─────────────┤
│ id (PK)       │ │  │ id (PK)        │  │ lesson_id   │◄─── PK
│ learner_id(FK)│─┘  │ lesson_id (FK) │  │ tag_id      │◄─── PK
│ lesson_id(FK) │    │ question_text  │  └──────┬──────┘
│ completed_at  │    │ option_a/b/c/d │         │
└───────────────┘    │ correct_option │   ┌─────▼──────┐
                     └────────────────┘   │   tags     │
┌───────────────┐                         ├────────────┤
│ quiz_attempts │                         │ id (PK)    │
├───────────────┤                         │ name       │
│ id (PK)       │                         └────────────┘
│ learner_id(FK)│
│ lesson_id(FK) │    ┌──────────────┐     ┌────────────────┐
│ score         │    │ forum_posts  │     │ forum_comments │
│ total_quest.  │    ├──────────────┤     ├────────────────┤
│ attempted_at  │    │ id (PK)      │     │ id (PK)        │
└───────────────┘    │ user_id (FK) │     │ post_id (FK)   │
                     │ language_id  │     │ user_id (FK)   │
                     │ title        │     │ body           │
                     │ body         │     │ created_at     │
                     │ created_at   │     └────────────────┘
                     └──────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| `InnoDB` engine with `utf8mb4` charset | Supports foreign key constraints and full Unicode for multilingual content |
| `ENUM` for user role (`learner`, `teacher`, `admin`) | Enforces valid roles at the database level |
| `ENUM` for difficulty (`beginner`, `intermediate`, `advanced`) | Ensures data consistency for filtering |
| `UNIQUE` constraint on `email` | Prevents duplicate registrations |
| `ON DELETE CASCADE` on foreign keys | Maintains referential integrity when users or lessons are deleted |
| Separate `lesson_tags` junction table | Implements many-to-many relationship between lessons and tags |
| `UNIQUE KEY` on `lesson_progress (learner_id, lesson_id)` | Prevents a learner from marking the same lesson complete twice |
| Password stored as bcrypt hash | Industry-standard security practice |

### Seed Data

The database is pre-populated with:
- **6 users** (3 teachers, 3 learners) with realistic profiles and UK-based community locations
- **10 languages** representing community languages spoken in the UK
- **8 categories** covering different aspects of language learning
- **12 tags** for content discovery
- **10 lessons** across multiple languages, categories, and difficulties
- **8 quiz questions** with multiple-choice answers
- **7 lesson progress records** and **3 quiz attempts** for demonstration
- **5 forum posts** and **6 forum comments** for community interaction

---

## 3. Task Breakdown and Developer Allocation

| Task | Developer | Status |
|------|-----------|--------|
| Project scaffolding (Express, PUG, Docker) | All team members | ✅ Complete |
| Database schema design (`db/schema.sql`) | All team members | ✅ Complete |
| Seed data creation (`db/seed.sql`) | All team members | ✅ Complete |
| Users list page (route + view) | Developer 1 | ✅ Complete |
| User profile page (route + view) | Developer 1 | ✅ Complete |
| Lessons listing page (route + view) | Developer 2 | ✅ Complete |
| Lesson detail page with quiz | Developer 2 | ✅ Complete |
| Categories/tags page (route + view) | Developer 3 | ✅ Complete |
| Authentication (register, login, logout) | Developer 1 | ✅ Complete |
| Layout template and CSS styling | Developer 3 | ✅ Complete |
| Docker configuration | All team members | ✅ Complete |

*Full task breakdown available on the GitHub Project Kanban board.*

---

## 4. GitHub Repository Information

- **Repository Link:** https://github.com/Saksen10/community-languages
- **GitHub Project Link:** *(Insert GitHub Project board link here)*

---

## 5. Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | PUG (Jade) | Server-side HTML templating |
| Frontend | CSS | Custom styling with CSS variables, responsive grid, dark gradients |
| Frontend | JavaScript | Client-side interactions (quiz handling, delete confirmations) |
| Backend | Node.js | Server-side JavaScript runtime |
| Backend | Express.js v4.21 | Web application framework |
| Database | MySQL 8 | Relational database for all application data |
| Auth | bcrypt | Password hashing |
| Auth | express-session | Session-based authentication |
| DevOps | Docker + Docker Compose | Containerised development and deployment |
| CI/CD | GitHub Actions | Automated syntax checking and Docker build |

---

*Screenshots of the GitHub Kanban board and contributor metrics to be appended below.*
