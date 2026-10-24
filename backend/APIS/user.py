from dotenv import load_dotenv
import os

import psycopg
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Database.insert_query import insert_users_query , insert_user_data
import bcrypt
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

def get_connection():
    return psycopg.connect(
        host=os.getenv("HOST"),
        port=int(os.getenv("DB_PORT", "5432")),
        dbname=os.getenv("DATABASE"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        sslmode="require",
        connect_timeout=15
    )


@app.post("/users")
async def insert_data(data: dict):
    hashed_password = bcrypt.hashpw(data.get("password").encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    query, params = insert_users_query(
        name=data.get("name"),
        email=data.get("email"),
        phone=data.get("phone"),
        password_hash=hashed_password,
        google_id=data.get("google_id"),
        profile_image=data.get("profile_image"),
        is_email_verified=data.get("is_email_verified"),
        is_active=data.get("is_active")
    )
    try:
        with get_connection() as conn:
            result = insert_user_data(conn, query, params)
            if result[1] == "SUCCESS":
                return { "data": result}
            else:
                return {"message": "Failed to insert data", "data": result}
    except Exception as e:
        return {"message": "Error inserting data", "error": str(e)}


# python -m uvicorn APIS.insert_apis:app --reload