# Setup Guide: Community Languages App

This guide explains how to set up the project on your local machine. You can run the application directly using your locally installed MySQL, or you can use Docker.

---

## Option 1: Running Locally (Without Docker)

Since you already have MySQL installed, this is the easiest method.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- MySQL Server installed and running locally
- Git

### Step 1: Clone and Install
1. Open your terminal or command prompt.
2. Navigate to the project folder (if not already there).
3. Install the required Node.js packages:
   ```bash
   npm install
   ```

### Step 2: Database Setup
1. Open your MySQL client (like MySQL Workbench, DBeaver, or the MySQL command-line tool).
2. Execute the schema script to create the database and tables. You can run the contents of the `db/schema.sql` file.
   - Using command line: `mysql -u root -p < db/schema.sql`
3. Execute the seed script to populate the database with dummy data. You can run the contents of the `db/seed.sql` file.
   - Using command line: `mysql -u root -p < db/seed.sql`

### Step 3: Configure Environment
1. In the root of the project, create a file named `.env`.
2. Copy the contents of `.env.example` into `.env`.
3. Update the `.env` file with your MySQL root credentials. It should look like this:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_root_password_here
   DB_NAME=community_languages
   DB_PORT=3306
   SESSION_SECRET=a_random_secret_string_for_sessions
   PORT=3000
   ```

### Step 4: Run the Application
1. Start the server using the development script:
   ```bash
   npm run dev
   ```
2. Open your web browser and go to: [http://localhost:3000](http://localhost:3000)

---

## Option 2: Running with Docker (For Future Use / Sharing)

If you install Docker later or share the project with someone who wants to run it instantly without installing MySQL or Node manually.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Step 1: Start the Containers
1. Open a terminal in the project root directory (where `docker-compose.yml` is located).
2. Run the following command:
   ```bash
   docker-compose up --build
   ```
3. Docker will download the necessary images (Node and MySQL), build the app image, initialize the database automatically using the files in the `db/` folder, and start the application.

### Step 2: Access the Application
- Open your web browser and go to: [http://localhost:3000](http://localhost:3000)

### Step 3: Stop the Containers
- To stop the application, press `Ctrl + C` in the terminal where it's running, or run:
  ```bash
  docker-compose down
  ```

---

## Dummy Users for Testing
The database seed script creates several test users. All test users have the password: **`password123`**

**Teachers:**
- amara@example.com
- raj@example.com
- fatima@example.com

**Learners:**
- tom@example.com
- sofia@example.com
- ahmed@example.com
