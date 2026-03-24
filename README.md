# Attendify - Student Attendance Tracker

A full-stack, production-ready web application built with the MERN stack (MongoDB, Express, React, Node.js) and Tailwind CSS. Attendify provides smart attendance tracking and forecasting so students always know exactly how many classes they need to attend to meet their threshold.

## Features
- **Dynamic Attendance Math Engine:** Predicts how many future classes you need to attend (or can afford to miss) to maintain a specific percentage.
- **"What If" Simulation:** See exactly how your attendance percentage will change if you skip the next class.
- **Smart Analytics Dashboard:** Clean, glassmorphism-inspired UI built with Tailwind showing critical warnings and visual progress rings.
- **Interactive Calendar:** Manage and visualize daily attendance with color-coded events using FullCalendar.js.
- **Comprehensive Subject Management:** Full CRUD operations for subjects, ensuring attendance is compartmentalized.

## Tech Stack
- **Frontend:** React, Tailwind CSS 3, Axios, FullCalendar.js, Lucide React
- **Backend:** Node.js, Express.js, JSON Web Tokens (JWT), Bcrypt
- **Database:** MongoDB (Mongoose)

## Core Math Logic
Attendify does *not* require you to input the total number of classes in a semester beforehand. It dynamically tracks classes based on recorded data:
- `Conducted` = Present + Absent + Mass Bunk
- `Attended` = Present
- `Percentage` = (Attended / Conducted) * 100

**To reach target P%:**
The system computes the minimum consecutive classes (`x`) you need to attend to reach `P%`:
`x = ceil((P * Conducted - 100 * Attended) / (100 - P))`

**To stay safe (miss classes):**
The system computes the maximum consecutive classes (`y`) you can miss and remain $\ge$ `P%`:
`y = floor((100 * Attended - P * Conducted) / P)`

## Setup and Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas URI)

### Backend Setup
1. Open the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (see `.env.example`):
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/attendify
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=30d
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```
4. Start the backend dev server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Open the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (see `.env.example`):
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```
4. Start the React development server:
   ```bash
   npm start
   ```

## Deployment
- **Backend:** Deploy on [Render](https://render.com/) or Heroku. Ensure you add your MongoDB Atlas URI to the environment variables.
- **Frontend:** Deploy on [Vercel](https://vercel.com/) or Netlify. Add `REACT_APP_API_URL` pointing to your deployed backend.

## Authors
Built by Antigravity.
