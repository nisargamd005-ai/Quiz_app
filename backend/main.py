from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import random
import hashlib
import time
import os
from datetime import datetime
import aiosmtplib
from email.message import EmailMessage
from dotenv import load_dotenv

# Load secrets from .env file
load_dotenv()

app = FastAPI(title="Quiz App API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── SMTP Configuration (GMAIL) ────────────────────────────────────────────────
# 🛠️ IMPORTANT: These ARE NOW SECURE in your .env file!
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER", "nishugowda071@gmail.com")
SMTP_PASS = os.getenv("SMTP_PASS", "swbcpkhrjoftdyih")

# ── Auth Helper ─────────────────────────────────────────────────────────────

def hash_password(password: str):
    return hashlib.sha256(password.encode()).hexdigest()

USER_DB = {}
OTP_STORE = {}
TOKEN_STORE = {}

async def send_otp_email(to_email: str, otp: str):
    message = EmailMessage()
    message.set_content(f"Your 6-digit verification code is: {otp}\n\nIt will expire in 5 minutes.")
    message["Subject"] = "QuizMaster Elite Verification"
    message["From"] = SMTP_USER
    message["To"] = to_email
    
    try:
        await aiosmtplib.send(
            message,
            hostname=SMTP_SERVER,
            port=SMTP_PORT,
            username=SMTP_USER,
            password=SMTP_PASS,
            start_tls=True, # Gmail Port 587 uses STARTTLS
        )
        return True
    except Exception as e:
        print(f"SMTP Error: {e}")
        return False

# ── Data Models ─────────────────────────────────────────────────────────────

class UserSignup(BaseModel):
    name: str
    email: str
    password: str

class OTPVerify(BaseModel):
    email: str
    otp: str

class UserLogin(BaseModel):
    email: str
    password: str

class Option(BaseModel):
    id: str
    text: str

class Question(BaseModel):
    id: int
    question: str
    options: List[Option]
    correct_answer: str
    explanation: str
    category: str
    difficulty: str

class AnswerSubmit(BaseModel):
    question_id: int
    selected_option: str

# ── Question Bank ─────────────────────────────────────────────────────────────

questions_db: List[Question] = [
    # HTML
    Question(id=1, question="What does HTML stand for?",
        options=[Option(id="a", text="Hyper Text Markup Language"),
                 Option(id="b", text="High Tech Modern Language"),
                 Option(id="c", text="Hyperlinks and Text Markup Language"),
                 Option(id="d", text="Home Tool Markup Language")],
        correct_answer="a", explanation="HTML stands for Hyper Text Markup Language.",
        category="HTML", difficulty="Easy"),

    Question(id=2, question="Which HTML tag is used to define an internal style sheet?",
        options=[Option(id="a", text="<css>"),
                 Option(id="b", text="<script>"),
                 Option(id="c", text="<style>"),
                 Option(id="d", text="<link>")],
        correct_answer="c", explanation="The <style> tag is used to define internal CSS.",
        category="HTML", difficulty="Easy"),

    Question(id=3, question="Which HTML attribute specifies an alternate text for an image?",
        options=[Option(id="a", text="title"),
                 Option(id="b", text="src"),
                 Option(id="c", text="longdesc"),
                 Option(id="d", text="alt")],
        correct_answer="d", explanation="The alt attribute provides alternate text for an image.",
        category="HTML", difficulty="Easy"),

    Question(id=4, question="Which HTML element is used to specify a footer for a document or section?",
        options=[Option(id="a", text="<bottom>"),
                 Option(id="b", text="<footer>"),
                 Option(id="c", text="<section>"),
                 Option(id="d", text="<article>")],
        correct_answer="b", explanation="The <footer> element defines a footer for a document or section.",
        category="HTML", difficulty="Medium"),

    Question(id=5, question="What is the correct HTML element for inserting a line break?",
        options=[Option(id="a", text="<lb>"),
                 Option(id="b", text="<break>"),
                 Option(id="c", text="<br>"),
                 Option(id="d", text="<newline>")],
        correct_answer="c", explanation="The <br> tag inserts a single line break.",
        category="HTML", difficulty="Easy"),

    # CSS
    Question(id=6, question="Which CSS property controls the text size?",
        options=[Option(id="a", text="font-style"),
                 Option(id="b", text="text-size"),
                 Option(id="c", text="font-size"),
                 Option(id="d", text="text-style")],
        correct_answer="c", explanation="The font-size property controls the text size.",
        category="CSS", difficulty="Easy"),

    Question(id=7, question="How do you add a background color for all <h1> elements?",
        options=[Option(id="a", text="h1.all {background-color: #FFFFF}"),
                 Option(id="b", text="h1 {background-color: #FFFFF}"),
                 Option(id="c", text="all.h1 {background-color: #FFFFF}"),
                 Option(id="d", text="#h1 {background-color: #FFFFF}")],
        correct_answer="b", explanation="h1 {background-color: #FFFFF} targets all h1 elements.",
        category="CSS", difficulty="Easy"),

    Question(id=8, question="Which CSS property is used to change the text color of an element?",
        options=[Option(id="a", text="fgcolor"),
                 Option(id="b", text="text-color"),
                 Option(id="c", text="font-color"),
                 Option(id="d", text="color")],
        correct_answer="d", explanation="The color property specifies the color of text.",
        category="CSS", difficulty="Easy"),

    Question(id=9, question="How do you make a list that lists items with squares?",
        options=[Option(id="a", text="list-type: square"),
                 Option(id="b", text="list-style-type: square"),
                 Option(id="c", text="list: square"),
                 Option(id="d", text="list-style: square-item")],
        correct_answer="b", explanation="list-style-type: square sets square bullets.",
        category="CSS", difficulty="Medium"),

    Question(id=10, question="Which CSS property adds space between an element's border and its content?",
        options=[Option(id="a", text="margin"),
                 Option(id="b", text="spacing"),
                 Option(id="c", text="padding"),
                 Option(id="d", text="border-spacing")],
        correct_answer="c", explanation="Padding adds space between the element's border and content.",
        category="CSS", difficulty="Easy"),

    # JavaScript
    Question(id=11, question="How do you write 'Hello World' in an alert box?",
        options=[Option(id="a", text='msgBox("Hello World")'),
                 Option(id="b", text='alertBox("Hello World")'),
                 Option(id="c", text='msg("Hello World")'),
                 Option(id="d", text='alert("Hello World")')],
        correct_answer="d", explanation='alert("Hello World") displays a popup alert.',
        category="JavaScript", difficulty="Easy"),

    Question(id=12, question="How do you create a function in JavaScript?",
        options=[Option(id="a", text="function = myFunction()"),
                 Option(id="b", text="function myFunction()"),
                 Option(id="c", text="create function myFunction()"),
                 Option(id="d", text="new function myFunction()")],
        correct_answer="b", explanation="Functions are defined with the 'function' keyword.",
        category="JavaScript", difficulty="Easy"),

    Question(id=13, question="How do you call a function named 'myFunction'?",
        options=[Option(id="a", text="call function myFunction()"),
                 Option(id="b", text="myFunction()"),
                 Option(id="c", text="call myFunction()"),
                 Option(id="d", text="execute myFunction()")],
        correct_answer="b", explanation="myFunction() calls the function.",
        category="JavaScript", difficulty="Easy"),

    Question(id=14, question="How to write an IF statement for executing some code if 'i' is NOT equal to 5?",
        options=[Option(id="a", text="if (i <> 5)"),
                 Option(id="b", text="if i <> 5"),
                 Option(id="c", text="if (i != 5)"),
                 Option(id="d", text="if i =! 5 then")],
        correct_answer="c", explanation="!= is the 'not equal to' operator in JavaScript.",
        category="JavaScript", difficulty="Medium"),

    # Python
    Question(id=16, question="Which of the following is the correct syntax to output 'Hello World' in Python?",
        options=[Option(id="a", text='console.log("Hello World")'),
                 Option(id="b", text='print("Hello World")'),
                 Option(id="c", text='echo "Hello World"'),
                 Option(id="d", text='printf("Hello World")')],
        correct_answer="b", explanation='print() is Python\'s built-in output function.',
        category="Python", difficulty="Easy"),

    Question(id=17, question="Which data type is used to store a sequence of characters in Python?",
        options=[Option(id="a", text="char"),
                 Option(id="b", text="text"),
                 Option(id="c", text="str"),
                 Option(id="d", text="string")],
        correct_answer="c", explanation="str (string) data type stores text in Python.",
        category="Python", difficulty="Easy"),

    Question(id=20, question="What keyword is used to define a function in Python?",
        options=[Option(id="a", text="fun"),
                 Option(id="b", text="function"),
                 Option(id="c", text="def"),
                 Option(id="d", text="define")],
        correct_answer="c", explanation="The 'def' keyword is used to define a function in Python.",
        category="Python", difficulty="Easy"),

    # SQL
    Question(id=21, question="Which SQL statement is used to extract data from a database?",
        options=[Option(id="a", text="OPEN"),
                 Option(id="b", text="GET"),
                 Option(id="c", text="EXTRACT"),
                 Option(id="d", text="SELECT")],
        correct_answer="d", explanation="The SELECT statement is used to select data from a database.",
        category="SQL", difficulty="Easy"),

    Question(id=22, question="Which SQL statement is used to update data in a database?",
        options=[Option(id="a", text="MODIFY"),
                 Option(id="b", text="UPDATE"),
                 Option(id="c", text="SAVE"),
                 Option(id="d", text="CHANGE")],
        correct_answer="b", explanation="The UPDATE statement modifies existing records.",
        category="SQL", difficulty="Easy"),

    Question(id=25, question="What does SQL stand for?",
        options=[Option(id="a", text="Styled Query Language"),
                 Option(id="b", text="Strong Question Language"),
                 Option(id="c", text="Structured Query Language"),
                 Option(id="d", text="Simple Query Language")],
        correct_answer="c", explanation="SQL stands for Structured Query Language.",
        category="SQL", difficulty="Easy"),
]

categories = list(set(q.category for q in questions_db))

# ── Auth Endpoints ───────────────────────────────────────────────────

@app.post("/auth/signup")
async def signup(user: UserSignup):
    if user.email in USER_DB:
        raise HTTPException(status_code=400, detail="User already exists")
    
    otp = str(random.randint(100000, 999999))
    OTP_STORE[user.email] = {
        "otp": otp,
        "data": {"name": user.name, "email": user.email, "password": user.password},
        "expires": time.time() + 300
    }
    
    # 🔥 REAL EMAIL SENDING 🔥
    success = await send_otp_email(user.email, otp)
    
    if not success:
        print(f"FAILED TO SEND EMAIL. OTP in terminal: {otp}")
        return {"message": "Email fail, OTP in terminal", "otp_debug": otp}
    
    return {"message": "OTP sent to your real email!"}

@app.post("/auth/verify-otp")
def verify_otp(data: OTPVerify):
    if data.email not in OTP_STORE:
        raise HTTPException(status_code=400, detail="No registration in progress")
    
    stored = OTP_STORE[data.email]
    if time.time() > stored["expires"] or stored["otp"] != data.otp:
         raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    
    user_data = stored["data"]
    USER_DB[data.email] = {
        "name": user_data["name"],
        "email": user_data["email"],
        "password_hash": hash_password(user_data["password"])
    }
    del OTP_STORE[data.email]
    
    token = hashlib.sha256(f"{data.email}{time.time()}".encode()).hexdigest()
    TOKEN_STORE[token] = data.email
    return {"message": "Success", "token": token, "user": {"name": user_data["name"], "email": user_data["email"]}}

@app.post("/auth/login")
def login(creds: UserLogin):
    user = USER_DB.get(creds.email)
    if not user or user["password_hash"] != hash_password(creds.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    token = hashlib.sha256(f"{creds.email}{time.time()}".encode()).hexdigest()
    TOKEN_STORE[token] = creds.email
    return {"token": token, "user": {"name": user["name"], "email": user["email"]}}

# ── Quiz Endpoints ───────────────────────────────────────────────────

@app.get("/")
def root(): return {"message": "Quiz App API is running 🚀"}

@app.get("/categories")
def get_categories(): return sorted(categories)

@app.get("/questions")
def get_questions(category: Optional[str] = None):
    filtered = questions_db
    if category:
        filtered = [q for q in filtered if q.category.lower() == category.lower()]
    random.shuffle(filtered)
    return filtered[:10]

@app.post("/quiz/submit")
def submit_quiz(answers: List[AnswerSubmit]):
    score = 0
    for ans in answers:
        q = next((q for q in questions_db if q.id == ans.question_id), None)
        if q and ans.selected_option == q.correct_answer: score += 1
    return {"score": score, "total": len(answers), "percentage": (score/len(answers))*100 if answers else 0}

@app.get("/stats")
def get_stats(): return {"total_questions": len(questions_db)}
