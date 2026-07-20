# StudyQuest - Gamified Study Planner App

A premium, interactive, and gamified study planning application. It generates study schedules based on subject difficulty, tracking study streaks, using countdown timers, and awarding XP for completed tasks.

The project is structured as:
*   **`frontend/`**: The client-side interface built with Vite + React + Vanilla CSS (designed as a PWA, meaning it can be installed on phones and works fully offline using LocalStorage).
*   **`backend/`**: A Node.js Express server to backup and synchronize data.
*   **`desktop/`**: An Electron wrapper to compile and package the app into a single standalone Windows executable (`.exe`).

---

## 🚀 How to Run in Development Mode

To start the application locally, you will need to start the frontend and (optionally) the backend.

### 1. Start the Frontend
1. Open a terminal in the `frontend` folder:
   ```bash
   cd frontend
   npm run dev
   ```
2. Open your browser and navigate to `http://localhost:5173`.

### 2. Start the Backend (Optional Sync Server)
1. Open a terminal in the `backend` folder:
   ```bash
   cd backend
   npm start
   ```
2. The sync server runs on `http://localhost:5000`.

---

## 📱 How to Install on Your Phone (PWA)

Because the app is built as a Progressive Web App (PWA), it can be installed on any iOS or Android phone and runs **fully offline** without needing a desktop server.

### Installing:
1. Host the built frontend files (`frontend/dist/` after running `npm run build`) on a free hosting provider (like Netlify, Vercel, or Firebase Hosting) or access the dev server via your local network.
2. Open the URL in your phone's browser (Safari for iPhone, Chrome for Android).
3. Tap the **Share** button (iOS) or the **Menu** button (Android).
4. Tap **"Add to Home Screen"** or **"Install App"**.
5. The app will appear on your phone's home screen with its own icon and run full-screen!

---

## 💻 How to Create the Windows Executable (.exe)

You can package the web application into a standalone desktop executable (`.exe`) that runs on Windows.

### Compilation Steps:
1. **Build the Frontend**: Compile the React source code.
   Open a terminal in the `frontend` folder and run:
   ```bash
   npm run build
   ```
   This compiles all static assets into `frontend/dist/`.

2. **Package the Desktop App**:
   Open a terminal in the `desktop` folder and run:
   ```bash
   npm run dist
   ```
   This will bundle the React app and Electron runner into a single portable application.
3. Once completed, you will find a standalone **`StudyQuest.exe`** executable file in:
   `desktop/dist/StudyQuest Portable.exe` (or similar depending on output). Double-click to run!

---

## 🎮 Features Included
1. **Intelligent Scheduler**: Input subjects, weekly target hours, and difficulty. The engine plans your week placing harder subjects at optimal slots.
2. **compulsory Daily Subject option**: Toggle in study settings to study only one subject per day.
3. **Sunday Revision**: Sunday is automatically locked to compile and revise everything you learned during the week.
4. **Reminders Checklist**: Tracks incomplete tasks from the past 7 days, placing reminders at the top of your dashboard.
5. **circular countdown timer**: Pomodoro presets or custom timers to track study sessions.
6. **Gamified Rewards**: Confetti explosions, study streaks, and XP leveling keep you motivated!
