# Full-Stack Timetable Maker (MERN)

A modern full-stack web application for scheduling daily time blocks and tracking your tasks, built across the MERN stack with React, Tailwind CSS v4, and Node.js.

## Minimum Requirements

- Node.js (v18+)
- MongoDB running locally on port 27017 or a valid MongoDB URI.

## Folder Structure

- `/server` - Express backend REST API connecting to MongoDB Mongoose models. Handles authentication via JWT.
- `/client` - React frontend powered by Vite, with tailwindcss styling, `@dnd-kit/core` for drag-and-drop, and context-based state management.

## Installation & Setup

1. **Clone or navigate to the repository directory**

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```
   *Note: Ensure your `.env` contains `MONGO_URI`, `PORT`, and `JWT_SECRET`. A `.env` file should be auto-created.*

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   ```

## Running the Application Locally

1. **Start the backend server:**
   ```bash
   cd server
   node server.js
   ```
   *The server will run on `http://localhost:5000`.*

2. **Start the Vite development server:**
   ```bash
   cd client
   npm run dev
   ```
   *The client will usually run on `http://localhost:5173`.*

## Key Features

- **Authentication:** Secure signup and login with hashed passwords via bcrypt and JWT protection on routes.
- **Dynamic Dashboard:** A side-by-side view where you can verify your completion metrics for the day's schedule.
- **Drag-And-Drop Timetable:** Easily rearrange the chronological order of your time blocks utilizing active drag and drop mechanics powered by `@dnd-kit`.
- **Integrated Todo Functionality:** Checking off blocks instantly marks them complete, crossing them off the list dynamically and advancing your progress bar.
