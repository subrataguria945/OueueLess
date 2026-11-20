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

def join_queue_indb(user_id, shop_id, service_id):
    con = None

    try:
        con = get_connection()

        with con.cursor() as cur:
            cur.execute(
                
                 "CALL public.sp_join_queue(%s,%s,%s,NULL,NULL,NULL,NULL,NULL,NULL);",
                (user_id, shop_id, service_id),
                )

            result = cur.fetchone()

            if not result:
                con.rollback()
                return {
                    "status": 500,
                    "error": "NO_RESPONSE",
                    "message": "No response received from database"
                }

            (
                token_id,
                token_number,
                queue_position,
                estimated_wait_minutes,
                status_code,
                status_message
            ) = result

            if status_code == "SUCCESS":
                con.commit()

                return {
                    "status": 200,
                    "token_id": token_id,
                    "token_number": token_number,
                    "queue_position": queue_position,
                    "estimated_wait_minutes": estimated_wait_minutes,
                    "message": status_message
                }

            con.rollback()

            return {
                "status": 400,
                "error": status_code,
                "message": status_message
            }

    except Exception as e:
        if con:
            con.rollback()

        print("Join Queue DB Error:", e)

        return {
            "status": 500,
            "error": "DATABASE_ERROR",
            "message": str(e)
        }

    finally:
        if con:
            con.close()