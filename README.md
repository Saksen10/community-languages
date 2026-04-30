# Community Languages: Teach and Learn

A full-stack, dynamic, database-driven web application where users can teach and learn community languages. Built for university coursework around the theme of "Sharing, exchange and building community."

## 🚀 Features

**Phase 1 (Sprint 3 Core):**
- **Dynamic Views**: Server-side rendering using Pug templates for users, profiles, lessons, categories.
- **Database Driven**: MySQL backend powering all content.
- **Public Directory**: Browse community languages, categories, and teachers.
- **Responsive UI**: Accessible, clean design using custom CSS.

**Phase 2 (Sprint 4 Advanced):**
- **Authentication**: Secure login/registration with bcrypt password hashing.
- **Role-based Dashboards**: Separate learner and teacher workflows.
- **Lesson Management**: Teachers can create, edit, and delete comprehensive language lessons.
- **Interactive Quizzes**: Test knowledge at the end of lessons.
- **Progress Tracking**: Learners can mark lessons as complete.
- **Community Forum**: Ask questions and connect with others.
- **Points System**: Gamification for engagement (creating lessons, passing quizzes, posting in forum).
- **Recommendations**: Smart lesson suggestions based on user interests.

## 🛠️ Technology Stack

- **Frontend**: HTML, CSS, JavaScript, Pug (Templating)
- **Backend**: Node.js, Express.js
- **Database**: MySQL 8.0
- **DevOps**: Docker, Docker Compose, GitHub Actions (CI/CD)

## 📦 Setup Instructions

For detailed setup instructions on running with a local MySQL server or using Docker, please refer to the [SETUP_GUIDE.md](./SETUP_GUIDE.md) document.

### Quick Start (Local Setup)

1. Clone the repository
2. Install dependencies: `npm install`
3. Setup the MySQL database using `db/schema.sql` and `db/seed.sql`
4. Copy `.env.example` to `.env` and configure your database credentials
5. Run the application: `npm run dev` (for development) or `npm start` (for production)
6. Access the application at `http://localhost:3000`

### Quick Start (Docker)

1. Make sure Docker and Docker Compose are installed
2. Run `docker-compose up --build -d`
3. The database will automatically initialize
4. Access the application at `http://localhost:3000`

## 🧪 Testing

Run a basic syntax validation check:
```bash
npm run check
```
This is automatically run by GitHub Actions on push/pull requests.

## 🤝 Project Info

**Group Name:** Language Connect
**Project Name:** Community Languages: Teach and Learn
