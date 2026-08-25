# Smart Bake Hub

Smart Bake Hub is a modern, full-stack web application designed for Wijayasiri Fresh Food (Pvt) Ltd. It features a robust admin dashboard, user management, product catalog, and (upcoming) AI-powered integrations.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MySQL](https://www.mysql.com/) (or XAMPP for local development)
- Git

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### 1. Database Setup

This project uses MySQL. If you are using XAMPP, start the MySQL module from the XAMPP control panel.
The database schema and initial data can be initialized automatically.

Navigate to the `backend` directory and run the initialization script:

```bash
cd backend
node scripts/initDb.js
```

*Note: This script will create the `smart_bake_hub` database, tables, and insert initial categories.*

### 2. Backend Setup

The backend is built with Node.js and Express.

1. Open a new terminal and navigate to the `backend` folder:

   ```bash
   cd backend
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the backend development server:

   ```bash
   npm run start
   ```

   *If `npm run start` is not configured, use `npx nodemon server.js` or `node server.js`.*
   The backend API will run on `http://localhost:5000`.

### 3. Frontend Setup

The frontend is built with React and Vite.

1. Open a new terminal and navigate to the `frontend` folder:

   ```bash
   
   cd frontend
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the frontend development server:

   ```bash
   npm run dev
   ```

   The frontend app will be accessible at `http://localhost:5173` (or another port specified by Vite).

## Default Accounts

For testing the Admin Dashboard, you can register a new account on the frontend and manually change the role to `admin` in your MySQL database, or use the API endpoint to update your role.

## Technologies Used

- **Frontend:** React, Vite, Tailwind CSS, Zustand, React Router
- **Backend:** Node.js, Express, MySQL (mysql2), JWT, BcryptJS
