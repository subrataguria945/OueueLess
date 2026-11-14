import psycopg
import os
from psycopg.rows import dict_row

# Database connection helper
def get_connection():
    return psycopg.connect(
        host=os.getenv("HOST"),
        dbname=os.getenv("DATABASE"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        port=os.getenv("DB_PORT", "5432"),
    )

# Fetch all users for admin view via sp_get_all_user_details
def get_all_users_details():
    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT * FROM public.sp_get_all_user_details()")
            return cur.fetchall()

# Update user profile via sp_update_user stored procedure
def update_user_indb(user_id, fullname, phone, profile_image , address):
    con = None
    try:
        con = psycopg.connect(
            host=os.getenv("HOST"),
            dbname=os.getenv("DATABASE"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            port=os.getenv("DB_PORT"),
        )
        print("Database connection established successfully.")
    except Exception as e:
        print(f"Error in database connection: {e}")
        return {"status": 404, "error": "Error While Connecting DB"}
    else:
        with con.cursor() as cur:
            try:
                cur.execute(
                    "CALL public.sp_update_user(%s,%s,%s,%s,%s,NULL,NULL);",
                    (user_id, fullname, phone, profile_image,address),
                )
                result = cur.fetchone()
                if result:
                    status_code, status_message = result
                    print("Status Code:", status_code)
                    print("Message:", status_message)

                    if status_code == "SUCCESS":
                        con.commit()
                        print("User Updated Successfully.")
                        return {"status": 200, "message": status_message}
                    else:
                        con.rollback()
                        print(f"User Update Failed Reason : {status_message}")
                        return {
                            "status": 404,
                            "error": status_code,
                            "message": status_message,
                        }
                else:
                    return {"status": 404, "error": "No Response From DB"}

            except Exception as e:
                print(f"Error in database query: {e}")
                return {"status": 404, "error": "Error While Executing The Query"}
    finally:
        if con:
            con.close()