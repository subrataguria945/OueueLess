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






# Check role and active status of a user
def get_user_role_and_status(user_id: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT roleid, status FROM public.users WHERE userid = %s",
                (user_id,),
            )
            return cur.fetchone()






# Hard delete owner (disabled in router, soft status update preferred)
def delete_owner_indb(admin_user_id,owner_id):

    con=None
    try: 
        con = psycopg.connect(
            host=os.getenv("HOST"),
            dbname=os.getenv("DATABASE"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            port=os.getenv("DB_PORT")
        )
        print("Database connection established successfully.")
    except Exception as e:
        print(f"Error in database connection: {e}")
        return {"status": 404, "error": "Error While Connecting DB"}
    else:               
       with con.cursor() as cur:
          try:
            cur.execute(
                "CALL public.sp_delete_owner(%s, %s, NULL, NULL);",
                (admin_user_id, owner_id, )
            )
            result = cur.fetchone()
            if result:  
                
                status_code, status_message = result  
                print("Status Code:", status_code)
                print("Message:", status_message)

                if status_code == "SUCCESS":
                    con.commit()
                    con.close()
                    print("Owner  Deleted Successfully.")
                    return {"status": 200, "message": status_message}
                else:
                    con.rollback()
                    con.close()
                    print(f"Owner Delete Failed Reason : {status_message}")
                    return {"status": 404, "error": status_code, "message": status_message}
            else:
                return {"status": 404, "error": "No Response From DB"}
                
          except Exception as e:
            print(f"Error in database query: {e}")
            return {"status": 404, "error": "Error While Executing The Query"}
                
    finally:
       if con:
           con.close()           




# Fetch shop details for an owner
def get_shops_details_from_db(owner_id: int, user_id: int):
    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                "SELECT * FROM public.sp_get_owner_shops_by_ids(%s, %s)",
                (owner_id, user_id),
            )
            return cur.fetchall()


