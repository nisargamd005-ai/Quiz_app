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
    # Users
    conn.execute("""
    CREATE TABLE IF NOT EXISTS users (
        email TEXT PRIMARY KEY,
        name TEXT,
        password_hash TEXT,
        badges TEXT DEFAULT '[]'
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
        hint TEXT
    )""")
    # Quiz Results
    conn.execute("""
    CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT,
        score INTEGER,
        total INTEGER,
        percentage REAL,
        category TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )""")
    conn.commit()
    
    # 🧪 Massive Elite Seeding
    res = conn.execute("SELECT COUNT(*) FROM questions").fetchone()
    if res[0] <= 5: # If empty or only the demo questions exist
        import json
        seed_data = [
            # 🌐 HTML (5 Questions)
            ("What does HTML stand for?", json.dumps([{"id":"a","text":"Hyper Text Markup Language"},{"id":"b","text":"High Tech Modern Language"},{"id":"c","text":"Hyperlinks"},{"id":"d","text":"Home Tool"}]), "a", "HTML is the standard markup language for documents designed to be displayed in a web browser.", "HTML", "Easy", "Markup..."),
            ("Which HTML element is used for the largest heading?", json.dumps([{"id":"a","text":"<heading>"},{"id":"b","text":"<h1>"},{"id":"c","text":"<h6>"},{"id":"d","text":"<head>"}]), "b", "<h1> is the standard for top-level headings.", "HTML", "Easy", "Highest level..."),
            ("What is the correct HTML element for inserting a line break?", json.dumps([{"id":"a","text":"<break>"},{"id":"b","text":"<lb>"},{"id":"c","text":"<br>"},{"id":"d","text":"<hr>"}]), "c", "<br> is used for line breaks.", "HTML", "Easy", "Break..."),
            ("How can you make a numbered list?", json.dumps([{"id":"a","text":"<ul>"},{"id":"b","text":"<list>"},{"id":"c","text":"<ol>"},{"id":"d","text":"<dl>"}]), "c", "<ol> stands for Ordered List.", "HTML", "Easy", "Ordered..."),
            ("Which attribute specifies an alternate text for an image?", json.dumps([{"id":"a","text":"title"},{"id":"b","text":"src"},{"id":"c","text":"alt"},{"id":"d","text":"longdesc"}]), "c", "The alt attribute provides alternate text.", "HTML", "Easy", "Alternate..."),

            # 🎨 CSS (5 Questions)
            ("Which CSS property controls text size?", json.dumps([{"id":"a","text":"font-style"},{"id":"b","text":"text-size"},{"id":"c","text":"font-size"},{"id":"d","text":"text-style"}]), "c", "font-size is the standard property.", "CSS", "Easy", "Size of font..."),
            ("What does CSS stand for?", json.dumps([{"id":"a","text":"Computer Style Sheets"},{"id":"b","text":"Creative Style Sheets"},{"id":"c","text":"Cascading Style Sheets"},{"id":"d","text":"Colorful Style Sheets"}]), "c", "CSS defines how HTML elements are to be displayed.", "CSS", "Easy", "Cascading..."),
            ("Which is the correct CSS syntax?", json.dumps([{"id":"a","text":"{body:color=black;}"},{"id":"b","text":"body:color=black;"},{"id":"c","text":"body {color: black;}"},{"id":"d","text":"{body;color:black;}"}]), "c", "Selectors use curly braces and colons.", "CSS", "Medium", "Body selector..."),
            ("How do you select an element with id 'demo'?", json.dumps([{"id":"a","text":"*demo"},{"id":"b","text":"#demo"},{"id":"c","text":".demo"},{"id":"d","text":"demo"}]), "b", "# is used for IDs.", "CSS", "Easy", "ID selector..."),
            ("What is the default value of the position property?", json.dumps([{"id":"a","text":"relative"},{"id":"b","text":"fixed"},{"id":"c","text":"absolute"},{"id":"d","text":"static"}]), "d", "static is the default browser behavior.", "CSS", "Medium", "Non-moving..."),

            # ⚡ JavaScript (5 Questions)
            ("Inside which HTML element do we put JavaScript?", json.dumps([{"id":"a","text":"<js>"},{"id":"b","text":"<scripting>"},{"id":"c","text":"<script>"},{"id":"d","text":"<javascript>"}]), "c", "The <script> tag is used.", "JavaScript", "Easy", "Tag name..."),
            ("How do you write 'Hello World' in an alert box?", json.dumps([{"id":"a","text":"msg('Hello')"},{"id":"b","text":"alertBox('Hello')"},{"id":"c","text":"alert('Hello')"},{"id":"d","text":"msgBox('Hello')"}]), "c", "alert() is the standard window method.", "JavaScript", "Easy", "Warning box..."),
            ("How do you create a function in JavaScript?", json.dumps([{"id":"a","text":"function = myFunction()"},{"id":"b","text":"function:myFunction()"},{"id":"c","text":"function myFunction()"},{"id":"d","text":"new function()"}]), "c", "function keyword defines the block.", "JavaScript", "Easy", "New block..."),
            ("How to write an IF statement in JavaScript?", json.dumps([{"id":"a","text":"if i = 5 then"},{"id":"b","text":"if i == 5 then"},{"id":"c","text":"if (i == 5)"},{"id":"d","text":"if i = 5"}]), "c", "IF statements use parentheses in JS.", "JavaScript", "Easy", "Condition..."),
            ("Which operator is used to assign a value?", json.dumps([{"id":"a","text":"*"},{"id":"b","text":"-"},{"id":"c","text":"="},{"id":"d","text":"x"}]), "c", "= is the assignment operator.", "JavaScript", "Easy", "Equal sign..."),

            # 🐍 Python (5 Questions)
            ("How do you create a function in Python?", json.dumps([{"id":"a","text":"function = myFunction()"},{"id":"b","text":"def myFunction()"},{"id":"c","text":"create function()"},{"id":"d","text":"new function()"}]), "b", "def keyword is used in Python.", "Python", "Medium", "Shortcut for define..."),
            ("What is the correct file extension for Python?", json.dumps([{"id":"a","text":".pyt"},{"id":"b","text":".pyw"},{"id":"c","text":".py"},{"id":"d","text":".pt"}]), "c", ".py is the universal extension.", "Python", "Easy", "Short for python..."),
            ("How do you insert COMMENTS in Python code?", json.dumps([{"id":"a","text":"# comment"},{"id":"b","text":"// comment"},{"id":"c","text":"/* comment */"},{"id":"d","text":"-- comment"}]), "a", "# is used for single-line comments.", "Python", "Easy", "Hash..."),
            ("Which collection is ordered and changeable?", json.dumps([{"id":"a","text":"Set"},{"id":"b","text":"Tuple"},{"id":"c","text":"List"},{"id":"d","text":"Dictionary"}]), "c", "Lists are the most flexible ordered collection.", "Python", "Medium", "Brackets... []"),
            ("How do you start a WHILE loop in Python?", json.dumps([{"id":"a","text":"while x > y {"},{"id":"b","text":"while (x > y)"},{"id":"c","text":"while x > y:"},{"id":"d","text":"while x > y then"}]), "c", "Loops use colons in Python.", "Python", "Easy", "Colon..."),

            # 🗄️ SQL (Expand)
            ("Which keyword is used to return only different values?", json.dumps([{"id":"a","text":"DIFFERENT"},{"id":"b","text":"UNIQUE"},{"id":"c","text":"DISTINCT"},{"id":"d","text":"EXCLUSIVE"}]), "c", "DISTINCT removes duplicates.", "SQL", "Medium", "Unique..."),
            ("Which SQL keyword is used to sort the result-set?", json.dumps([{"id":"a","text":"SORT BY"},{"id":"b","text":"ORDER BY"},{"id":"c","text":"GROUP BY"},{"id":"d","text":"ARRANGE BY"}]), "b", "ORDER BY is the standard for sorting.", "SQL", "Easy", "Order..."),
            
            # 🌐 HTML (Advanced Pack)
            ("Which HTML element is used to specify a footer for a document?", json.dumps([{"id":"a","text":"<bottom>"},{"id":"b","text":"<section>"},{"id":"c","text":"<footer>"},{"id":"d","text":"<end>"}]), "c", "The <footer> tag is used.", "HTML", "Easy", "Bottom part..."),
            ("In HTML, what does the <canvas> element do?", json.dumps([{"id":"a","text":"Display database records"},{"id":"b","text":"Draw graphics via JS"},{"id":"c","text":"Manipulate photos"},{"id":"d","text":"Store local data"}]), "b", "Canvas is used for dynamic graphics.", "HTML", "Hard", "Drawing surface..."),
            ("Which HTML element defines navigation links?", json.dumps([{"id":"a","text":"<navigate>"},{"id":"b","text":"<nav>"},{"id":"c","text":"<links>"},{"id":"d","text":"<menu>"}]), "b", "<nav> is the semantic element.", "HTML", "Easy", "Nav..."),
            
            # 🎨 CSS (Advanced Pack)
            ("How do you make the text bold in CSS?", json.dumps([{"id":"a","text":"font:bold;"},{"id":"b","text":"style:bold;"},{"id":"c","text":"font-weight:bold;"},{"id":"d","text":"text-decoration:bold;"}]), "c", "font-weight controls thickness.", "CSS", "Easy", "Weight..."),
            ("Which property is used to change the left margin?", json.dumps([{"id":"a","text":"padding-left"},{"id":"b","text":"indent"},{"id":"c","text":"margin-left"},{"id":"d","text":"spacing"}]), "c", "margin-left is correct.", "CSS", "Easy", "Margin..."),
            ("How do you add a background color for all <h1> elements?", json.dumps([{"id":"a","text":"all.h1 {bg:red;}"},{"id":"b","text":"h1.all {color:red;}"},{"id":"c","text":"h1 {background-color:red;}"},{"id":"d","text":"h1 {color:red;}"}]), "c", "background-color defines the fill.", "CSS", "Easy", "BG Color..."),

            # ⚡ JS (Logic Pack)
            ("What is the correct way to write a JS array?", json.dumps([{"id":"a","text":"var colors = (1:'red', 2:'blue')"},{"id":"b","text":"var colors = ['red', 'blue']"},{"id":"c","text":"var colors = 'red', 'blue'"},{"id":"d","text":"var colors = {'red', 'blue'}"}]), "b", "Arrays use square brackets.", "JavaScript", "Easy", "Brackets..."),
            ("Which event occurs when the user clicks on an HTML element?", json.dumps([{"id":"a","text":"onchange"},{"id":"b","text":"onmouseclick"},{"id":"c","text":"onclick"},{"id":"d","text":"onmouseover"}]), "c", "onclick is the standard event.", "JavaScript", "Easy", "Click..."),
            ("How do you round 7.25 to the nearest integer?", json.dumps([{"id":"a","text":"Math.rnd(7.25)"},{"id":"b","text":"round(7.25)"},{"id":"c","text":"Math.round(7.25)"},{"id":"d","text":"rnd(7.25)"}]), "c", "Math.round() is the correct method.", "JavaScript", "Medium", "Math object..."),

            # 🐍 Python (Elite Pack)
            ("How do you create a variable with the numeric value 5?", json.dumps([{"id":"a","text":"x = 5"},{"id":"b","text":"int x = 5"},{"id":"c","text":"x = int(5)"},{"id":"d","text":"Both A and C"}]), "d", "Python is dynamically typed but int(5) works too.", "Python", "Medium", "D is correct..."),
            ("Which method can be used to remove any whitespace from both the beginning and the end of a string?", json.dumps([{"id":"a","text":"len()"},{"id":"b","text":"ptrim()"},{"id":"c","text":"strip()"},{"id":"d","text":"trim()"}]), "c", "Python uses .strip() instead of .trim().", "Python", "Medium", "Strip..."),
            ("What is a correct syntax to output 'Hello World' in Python?", json.dumps([{"id":"a","text":"print('Hello World')"},{"id":"b","text":"echo 'Hello World'"},{"id":"c","text":"p('Hello World')"},{"id":"d","text":"console.log('Hello World')"}]), "a", "print() is the standard output.", "Python", "Easy", "Print..."),
        ]
        conn.executemany("INSERT INTO questions (question, options, correct_answer, explanation, category, difficulty, hint) VALUES (?,?,?,?,?,?,?)", seed_data)
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
    except: return False

# ── Models ──────────────────────────────────────────────────────────────────

class UserInfo(BaseModel):
    name: str
    email: str
    password: str

class LoginInfo(BaseModel):
    email: str
    password: str

class OTPVerify(BaseModel):
    email: str
    otp: str

class AnsSubmit(BaseModel):
    question_id: int
    selected_option: str

# ── AUTH Endpoints ─────────────────────────────────────────────────────────

OTP_STORE = {}

@app.post("/auth/signup")
async def signup(user: UserInfo):
    otp = str(random.randint(100000, 999999))
    OTP_STORE[user.email] = {"otp": otp, "data": user.dict(), "expires": time.time() + 300}
    await send_otp_email(user.email, otp)
    return {"message": "OTP Sent"}

@app.post("/auth/verify-otp")
def verify_otp(data: OTPVerify):
    stored = OTP_STORE.get(data.email)
    if not stored or stored["otp"] != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    user = stored["data"]
    p_hash = hashlib.sha256(user["password"].encode()).hexdigest()
    conn = get_db()
    try:
        conn.execute("INSERT INTO users (email, name, password_hash) VALUES (?,?,?)", (user["email"], user["name"], p_hash))
        conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="User exists")
    
    token = hashlib.sha256(f"{user['email']}{time.time()}".encode()).hexdigest()
    return {"token": token, "user": {"name": user["name"], "email": user["email"]}}

@app.post("/auth/login")
def login(creds: LoginInfo):
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email=?", (creds.email,)).fetchone()
    p_hash = hashlib.sha256(creds.password.encode()).hexdigest()
    if not user or user["password_hash"] != p_hash:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    token = hashlib.sha256(f"{creds.email}{time.time()}".encode()).hexdigest()
    return {"token": token, "user": {"name": user["name"], "email": user["email"]}}

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
            "hint": r["hint"]
        })
    random.shuffle(questions)
    return questions[:limit]

class QuizSubmission(BaseModel):
    user_email: str
    category: str
    answers: List[AnsSubmit]

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
    
    conn.execute("INSERT INTO results (user_email, score, total, percentage, category) VALUES (?,?,?,?,?)",
                 (sub.user_email, score, total, pct, sub.category))
    conn.commit()
    return {"score": score, "total": total, "percentage": pct}

# ── LEADERBOARD & STATS ──────────────────────────────────────────────

@app.get("/leaderboard")
def get_leaderboard():
    conn = get_db()
    # Average score per user
    rows = conn.execute("""
        SELECT name, AVG(percentage) as avg_pct
        FROM results JOIN users ON results.user_email = users.email
        GROUP BY email ORDER BY avg_pct DESC LIMIT 10
    """).fetchall()
    return [{"name": r["name"], "score": round(r["avg_pct"], 1)} for r in rows]

@app.get("/history/{email}")
def get_history(email: str):
    conn = get_db()
    rows = conn.execute("SELECT * FROM results WHERE user_email=? ORDER BY timestamp DESC", (email,)).fetchall()
    return [dict(r) for r in rows]

@app.get("/stats")
def get_stats():
    conn = get_db()
    total_q = conn.execute("SELECT COUNT(*) FROM questions").fetchone()[0]
    total_u = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    dist = conn.execute("SELECT category, COUNT(*) as count FROM questions GROUP BY category").fetchall()
    return {"total_questions": total_q, "total_users": total_u, "distribution": {r["category"]: r["count"] for r in dist}}

# ── ADMIN Dashboard ────────────────────────────────────────────────────────

@app.post("/admin/questions")
def add_question(q: dict):
    conn = get_db()
    import json
    conn.execute("INSERT INTO questions (question, options, correct_answer, explanation, category, difficulty, hint) VALUES (?,?,?,?,?,?,?)",
                 (q["question"], json.dumps(q["options"]), q["correct_answer"], q["explanation"], q["category"], q.get("difficulty", "Easy"), q.get("hint", "")))
    conn.commit()
    return {"message": "Question added"}

 i f   _ _ n a m e _ _   = =   ' _ _ m a i n _ _ ' : 
         i m p o r t   u v i c o r n 
         i m p o r t   o s 
         p o r t   =   i n t ( o s . e n v i r o n . g e t ( ' P O R T ' ,   8 0 8 0 ) ) 
         u v i c o r n . r u n ( a p p ,   h o s t = ' 0 . 0 . 0 . 0 ' ,   p o r t = p o r t )  
 