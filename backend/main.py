from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import random
import hashlib
import time
import os
import sqlite3
from datetime import datetime
import aiosmtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="QuizMaster Elite API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── DATABASE SETUP ─────────────────────────────────────────────────────────────

DB_PATH = "quiz_master.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    # Users (identifier is either email or phone number)
    conn.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        identifier TEXT UNIQUE,
        name TEXT,
        password_hash TEXT,
        type TEXT, -- 'email' or 'phone'
        badges TEXT DEFAULT '[]',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )""")
    # Questions
    conn.execute("""
    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT,
        options TEXT, -- JSON string
        correct_answer TEXT,
        explanation TEXT,
        category TEXT,
        difficulty TEXT,
        hint TEXT,
        type TEXT DEFAULT 'mcq' -- 'mcq' or 'sequence'
    )""")
    # Quiz Results
    conn.execute("""
    CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT, -- identifier
        score INTEGER,
        total INTEGER,
        percentage REAL,
        category TEXT,
        mode TEXT DEFAULT 'practice',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )""")
    # Bookmarks
    conn.execute("""
    CREATE TABLE IF NOT EXISTS bookmarks (
        user_id TEXT,
        question_id INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, question_id)
    )""")
    conn.commit()
    
    # Seeding
    res = conn.execute("SELECT COUNT(*) FROM questions").fetchone()
    if res[0] <= 5:
        import json
        seed_data = [
            ("What does HTML stand for?", json.dumps([{"id":"a","text":"Hyper Text Markup Language"},{"id":"b","text":"High Tech Modern Language"},{"id":"c","text":"Hyperlinks"},{"id":"d","text":"Home Tool"}]), "a", "HTML is standard.", "HTML", "Easy", "Markup..."),
            ("Which CSS property controls text size?", json.dumps([{"id":"a","text":"font-style"},{"id":"b","text":"text-size"},{"id":"c","text":"font-size"},{"id":"d","text":"text-style"}]), "c", "font-size is standard.", "CSS", "Easy", "Size..."),
        ]
        conn.executemany("INSERT INTO questions (question, options, correct_answer, explanation, category, difficulty, hint, type) VALUES (?,?,?,?,?,?,?,?)", [(*r, "mcq") if len(r)==7 else r for r in seed_data])
        conn.commit()

init_db()

# ── SMTP Settings ──────────────────────────────────────────────────────────
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_USER = os.getenv("SMTP_USER", "nishugowda071@gmail.com")
SMTP_PASS = os.getenv("SMTP_PASS", "swbcpkhrjoftdyih")

async def send_otp_email(to_email: str, otp: str):
    message = EmailMessage()
    message.set_content(f"Your 6-digit verification code is: {otp}\n\nIt will expire in 5 min.")
    message["Subject"] = "QuizMaster Verification"
    message["From"] = SMTP_USER
    message["To"] = to_email
    try:
        await aiosmtplib.send(message, hostname=SMTP_SERVER, port=587, username=SMTP_USER, password=SMTP_PASS, start_tls=True)
        return True
    except Exception as e:
        print(f"Email Error: {e}")
        return False

async def send_otp_sms(phone_number: str, otp: str):
    print(f"📱 [MOCK SMS] Sending OTP {otp} to {phone_number}...")
    return True

# ── Models ──────────────────────────────────────────────────────────────────
class UserInfo(BaseModel):
    name: str
    identifier: str
    password: str

class LoginInfo(BaseModel):
    identifier: str
    password: str

class OTPVerify(BaseModel):
    identifier: str
    otp: str

class AnsSubmit(BaseModel):
    question_id: int
    selected_option: str
    time_taken: Optional[int] = 0

class BookmarkReq(BaseModel):
    user_identifier: str
    question_id: int

# ── AUTH Endpoints ─────────────────────────────────────────────────────────
OTP_STORE = {}

@app.post("/auth/signup")
async def signup(user: UserInfo):
    import re
    is_email = re.match(r"[^@]+@[^@]+\.[^@]+", user.identifier)
    otp = str(random.randint(100000, 999999))
    OTP_STORE[user.identifier] = {"otp": otp, "data": user.dict(), "expires": time.time() + 300}
    if is_email:
        await send_otp_email(user.identifier, otp)
        return {"message": "OTP Sent", "type": "email"}
    else:
        await send_otp_sms(user.identifier, otp)
        return {"message": "Mock SMS Sent", "type": "phone", "mock_otp": otp}

@app.post("/auth/verify-otp")
def verify_otp(data: OTPVerify):
    stored = OTP_STORE.get(data.identifier)
    if not stored or stored["otp"] != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    user = stored["data"]
    p_hash = hashlib.sha256(user["password"].encode()).hexdigest()
    import re
    type_ = "email" if re.match(r"[^@]+@[^@]+\.[^@]+", user["identifier"]) else "phone"
    conn = get_db()
    try:
        conn.execute("INSERT INTO users (identifier, name, password_hash, type) VALUES (?,?,?,?)", 
                     (user["identifier"], user["name"], p_hash, type_))
        conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="User exists")
    token = hashlib.sha256(f"{user['identifier']}{time.time()}".encode()).hexdigest()
    return {"token": token, "user": {"name": user["name"], "identifier": user["identifier"]}}

@app.post("/auth/login")
def login(creds: LoginInfo):
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE identifier=?", (creds.identifier,)).fetchone()
    p_hash = hashlib.sha256(creds.password.encode()).hexdigest()
    if not user or user["password_hash"] != p_hash:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    token = hashlib.sha256(f"{creds.identifier}{time.time()}".encode()).hexdigest()
    return {"token": token, "user": {"name": user["name"], "identifier": user["identifier"]}}

@app.delete("/users/{identifier}")
def delete_user_account(identifier: str):
    conn = get_db()
    conn.execute("DELETE FROM results WHERE user_id=?", (identifier,))
    conn.execute("DELETE FROM bookmarks WHERE user_id=?", (identifier,))
    conn.execute("DELETE FROM users WHERE identifier=?", (identifier,))
    conn.commit()
    return {"message": "Account deleted successfully"}

# ── QUIZ Endpoints ─────────────────────────────────────────────────────────
@app.get("/questions")
def get_questions(category: Optional[str] = None, difficulty: Optional[str] = None, limit: int = 10):
    conn = get_db()
    query = "SELECT * FROM questions WHERE 1=1"
    params = []
    if category:
        query += " AND LOWER(category) = LOWER(?)"
        params.append(category)
    if difficulty:
        query += " AND LOWER(difficulty) = LOWER(?)"
        params.append(difficulty)
    rows = conn.execute(query, params).fetchall()
    questions = []
    import json
    for r in rows:
        questions.append({
            "id": r["id"],
            "question": r["question"],
            "options": json.loads(r["options"]),
            "correct_answer": r["correct_answer"],
            "explanation": r["explanation"],
            "category": r["category"],
            "difficulty": r["difficulty"],
            "hint": r["hint"],
            "type": r["type"]
        })
    random.shuffle(questions)
    return questions[:limit]

class QuizSubmission(BaseModel):
    user_identifier: str
    category: str
    answers: List[AnsSubmit]
    mode: Optional[str] = "practice"

@app.post("/quiz/submit")
def submit_quiz(sub: QuizSubmission):
    conn = get_db()
    score = 0
    for ans in sub.answers:
        q = conn.execute("SELECT correct_answer FROM questions WHERE id=?", (ans.question_id,)).fetchone()
        if q and q["correct_answer"] == ans.selected_option:
            score += 1
    total = len(sub.answers)
    pct = (score/total)*100 if total > 0 else 0
    conn.execute("INSERT INTO results (user_id, score, total, percentage, category, mode) VALUES (?,?,?,?,?,?)",
                 (sub.user_identifier, score, total, pct, sub.category, sub.mode or "practice"))
    conn.commit()
    return {"score": score, "total": total, "percentage": pct}

@app.get("/leaderboard")
def get_leaderboard():
    conn = get_db()
    rows = conn.execute("""
        SELECT u.name, AVG(r.percentage) as avg_pct, MAX(r.percentage) as best_pct, COUNT(r.id) as quiz_count
        FROM results r JOIN users u ON r.user_id = u.identifier
        GROUP BY r.user_id ORDER BY avg_pct DESC LIMIT 10
    """).fetchall()
    return [{
        "name": r["name"],
        "score": round(r["avg_pct"], 1),
        "best": round(r["best_pct"], 1),
        "quizzes": r["quiz_count"]
    } for r in rows]

@app.get("/history/{identifier}")
def get_history(identifier: str):
    conn = get_db()
    rows = conn.execute("SELECT * FROM results WHERE user_id=? ORDER BY timestamp DESC", (identifier,)).fetchall()
    return [dict(r) for r in rows]

@app.get("/stats")
def get_stats():
    conn = get_db()
    total_q = conn.execute("SELECT COUNT(*) FROM questions").fetchone()[0]
    total_u = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    dist = conn.execute("SELECT category, COUNT(*) as count FROM questions GROUP BY category").fetchall()
    return {"total_questions": total_q, "total_users": total_u, "distribution": {r["category"]: r["count"] for r in dist}}

@app.get("/daily-challenge")
def get_daily_challenge():
    conn = get_db()
    today = datetime.now().strftime("%Y-%m-%d")
    seed = int(hashlib.md5(today.encode()).hexdigest(), 16) % (2**32)
    random.seed(seed)
    import json
    rows = conn.execute("SELECT * FROM questions").fetchall()
    questions = [{
        "id": r["id"],
        "question": r["question"],
        "options": json.loads(r["options"]),
        "correct_answer": r["correct_answer"],
        "explanation": r["explanation"],
        "category": r["category"],
        "difficulty": r["difficulty"],
        "hint": r["hint"]
    } for r in rows]
    random.shuffle(questions)
    random.seed()
    return {"date": today, "questions": questions[:5]}

@app.post("/daily-challenge/submit")
def submit_daily_challenge(sub: QuizSubmission):
    conn = get_db()
    score = 0
    for ans in sub.answers:
        q = conn.execute("SELECT correct_answer FROM questions WHERE id=?", (ans.question_id,)).fetchone()
        if q and q["correct_answer"] == ans.selected_option:
            score += 1
    total = len(sub.answers)
    pct = (score / total) * 100 if total > 0 else 0
    conn.execute("INSERT INTO results (user_id, score, total, percentage, category, mode) VALUES (?,?,?,?,?,?)",
                 (sub.user_identifier, score, total, pct, "Daily Challenge", "exam"))
    conn.commit()
    return {"score": score, "total": total, "percentage": pct}

@app.post("/bookmarks/toggle")
def toggle_bookmark(req: BookmarkReq):
    conn = get_db()
    exists = conn.execute("SELECT * FROM bookmarks WHERE user_id=? AND question_id=?", (req.user_identifier, req.question_id)).fetchone()
    if exists:
        conn.execute("DELETE FROM bookmarks WHERE user_id=? AND question_id=?", (req.user_identifier, req.question_id))
        action = "removed"
    else:
        conn.execute("INSERT INTO bookmarks (user_id, question_id) VALUES (?,?)", (req.user_identifier, req.question_id))
        action = "added"
    conn.commit()
    return {"status": action}

@app.get("/bookmarks/{user_id}")
def get_bookmarks(user_id: str):
    conn = get_db()
    rows = conn.execute("""
        SELECT q.* FROM bookmarks b 
        JOIN questions q ON b.question_id = q.id 
        WHERE b.user_id = ? ORDER BY b.timestamp DESC
    """, (user_id,)).fetchall()
    import json
    return [{
        "id": r["id"],
        "question": r["question"],
        "options": json.loads(r["options"]),
        "correct_answer": r["correct_answer"],
        "explanation": r["explanation"],
        "category": r["category"],
        "difficulty": r["difficulty"],
        "hint": r["hint"],
        "type": r["type"]
    } for r in rows]

@app.post("/admin/questions")
def add_question(q: dict):
    conn = get_db()
    import json
    conn.execute("INSERT INTO questions (question, options, correct_answer, explanation, category, difficulty, hint, type) VALUES (?,?,?,?,?,?,?,?)",
                 (q["question"], json.dumps(q["options"]), q["correct_answer"], q["explanation"], q["category"], q.get("difficulty", "Easy"), q.get("hint", ""), q.get("type", "mcq")))
    conn.commit()
    return {"message": "Question added"}

@app.delete("/admin/questions/{q_id}")
def delete_question(q_id: int):
    conn = get_db()
    conn.execute("DELETE FROM questions WHERE id=?", (q_id,))
    conn.commit()
    return {"deleted": True}

@app.get("/admin/users")
def get_all_users():
    conn = get_db()
    rows = conn.execute("SELECT id, identifier, name, type, timestamp FROM users ORDER BY timestamp DESC").fetchall()
    return [dict(r) for r in rows]

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get('PORT', 8080))
    uvicorn.run(app, host='0.0.0.0', port=port)
