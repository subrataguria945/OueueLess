# con = psycopg2.connect(host="localhost", dbname="TASK", user="postgres", password="pgsql", port=5432)
import psycopg
from dotenv import load_dotenv
from Database.create_query import create_all_tables
from Database.insert_query import insert_users
import os 
import bcrypt

load_dotenv()


conn = psycopg.connect(
    host=os.getenv("HOST"),
    dbname=os.getenv("DATABASE"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    port=os.getenv("DB_PORT")
)
print("Database connection established successfully.")





def insert_sample_data(conn):
    password = "Debo@123"

    salt = bcrypt.gensalt(rounds=10)

    hashed = bcrypt.hashpw(
        password.encode("utf-8"),
        salt
    ).decode("utf-8")

    query, params = insert_users(
        name="Debo Jana",
        email="debo@example.com",
        phone="9876543211",
        password_hash=hashed,
        google_id=None,
        profile_image=None,
        is_email_verified=False,
        is_active=True
    )

    try:
        with conn.cursor() as cur:
            cur.execute(query, params)

            result = cur.fetchone()

            if result:
                user_id, status_code, status_message = result

                print("User ID:", user_id)
                print("Status Code:", status_code)
                print("Message:", status_message)

        conn.commit()

    except Exception as e:
        conn.rollback()
        print("Error inserting user:", e)
    

insert_sample_data(conn)


conn.close()