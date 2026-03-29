# ⚡ QuizMaster — Web Dev Quiz App

A **W3Schools-style** interactive quiz app built with **FastAPI** + **React (Vite)**. Features a premium design with smooth animations and instant feedback.

---

## 🏗️ Tech Stack

| Layer | Tech |
|-------|------|
| Backend | FastAPI + Uvicorn |
| Frontend | React 18 + Vite |
| HTTP Client | Axios |
| Routing | React Router v6 |
| Styling | Vanilla CSS (Modern Glassmorphism) |

---

## 📁 Project Structure

```
Quiz_app/
├── backend/
│   ├── main.py          # FastAPI app + questions
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx       # Landing page (High-fidelity design)
    │   │   ├── QuizSetup.jsx  # Configuration
    │   │   ├── QuizPlay.jsx   # Live quiz with timer
    │   │   └── Results.jsx    # Score summary
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── api.js             # API client
    │   ├── App.jsx            # Routing
    │   └── index.css          # Design System
    └── index.html
```

---

## 🚀 Running Locally

### 1. Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8080
```

API runs at → **http://localhost:8080**

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

App runs at → **http://localhost:5173**

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List all categories |
| GET | `/questions` | Get questions (filtered) |
| GET | `/questions/{id}` | Get single question |
| POST | `/quiz/submit` | Get scored results |
| GET | `/stats` | Statistics |

---

## ✨ Key Features

- **Premium UI**: Ultra-modern glassmorphism design with sleek animations.
- **Dynamic Content**: 25 questions across Web Development categories.
- **Instant Response**: Real-time feedback and detailed explanations.
- **No Login Required**: Start challenging yourself immediately.
- **Responsive Layout**: Designed to look and feel great on any screen.