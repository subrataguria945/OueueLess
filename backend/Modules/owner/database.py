import psycopg
import os

def insert_owner_indb(admin_user_id, fullname, email, password, phone, max_shop_count, backup_id):
    con = None
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
                    "CALL public.sp_add_owner(%s, %s, %s, %s, %s, %s, %s, NULL, NULL, NULL, NULL);",
                    (admin_user_id, fullname, email, password, phone, max_shop_count, backup_id)
                )
                result = cur.fetchone()  
                if result:
                    status_code, status_message, new_owner_id, new_user_id = result 
                    print("New Owner ID:", new_owner_id)
                    print("New User ID:", new_user_id) 
                    print("Status Code:", status_code)
                    print("Message:", status_message)

                    if status_code == "SUCCESS":
                        con.commit()
                        con.close()
                        print("Owner Added Successfully.")
                        return {"status": 200, "new_owner_id": new_owner_id, "new_user_id": new_user_id, "message": status_message}
                    else:
                        con.rollback()
                        con.close()
                        print(f"Owner Addition Failed Reason : {status_message}")
                        return {"status": 404, "error": status_code, "message": status_message}
                else:
                    return {"status": 404, "error": "No Response From DB"}

            except Exception as e:
                print(f"Error in database query: {e}")
                return {"status": 404, "error": "Error While Executing The Query"}

    finally:
        if con:
            con.close()


def update_owner_status_indb(admin_id,owner_id,new_status):
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
                "CALL public.sp_update_owner_status(%s, %s, %s, NULL, NULL);",
                (admin_id, owner_id, new_status)
            )
            result = cur.fetchone()
            if result:  
                
                status_code, status_message = result  
                print("Status Code:", status_code)
                print("Message:", status_message)

                if status_code == "SUCCESS":
                    con.commit()
                    con.close()
                    print("Owner Status Updated Successfully.")
                    return {"status": 200, "message": status_message}
                else:
                    con.rollback()
                    con.close()
                    print(f"Owner Status Update Failed Reason : {status_message}")
                    return {"status": 404, "error": status_code, "message": status_message}
            else:
                return {"status": 404, "error": "No Response From DB"}
                
          except Exception as e:
            print(f"Error in database query: {e}")
            return {"status": 404, "error": "Error While Executing The Query"}
                
    finally:
       if con:
           con.close()