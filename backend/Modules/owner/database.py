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


# Fetch all owners and their shop details for admin
def get_all_owners_details(admin_id):
    with get_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT * FROM public.sp_get_all_owners_details(%s)", (admin_id,))
            return cur.fetchall()



# Check role and active status of a user
def get_user_role_and_status(user_id: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT roleid, status FROM public.users WHERE userid = %s",
                (user_id,),
            )
            return cur.fetchone()

# Insert a new owner via sp_add_owner stored procedure
def insert_owner_indb(admin_user_id, fullname, email, password, phone,address, max_shop_count, backup_id):
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
                    "CALL public.sp_add_owner(%s, %s, %s, %s, %s, %s,%s, %s, NULL, NULL, NULL, NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);",
                    (admin_user_id, fullname, email, password, phone, address , max_shop_count, backup_id)
                )
                result = cur.fetchone()  
                if result:
                    (status_code, status_message, owner_id, user_id , fullname , email , phone , address , max_shop_count , backup_id , shop_count , account_status , joined_date )  = result 
                    print("New Owner ID:", owner_id)
                    print("New User ID:", user_id) 
                    print("Status Code:", status_code)
                    print("Message:", status_message)

                    if status_code == "SUCCESS":
                        con.commit()
                        con.close()
                        print("Owner Added Successfully.")
                        return {"status": 200, "message": status_message,
                        "data" :{
                            "owner_id"  : owner_id,
                            "user_id": user_id,
                            "fullname": fullname,
                            "email": email,
                            "phone": phone,
                            "address": address,
                            "max_shop_count": max_shop_count,
                            "backup_id": backup_id,
                            "shop_count": shop_count,
                            "account_status": account_status,
                            "joined_date": joined_date
                        }}
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


# Update owner active/inactive status via sp_update_owner_status
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


# Update owner profile details via sp_update_owner
def update_owner_indb(admin_user_id,owner_id,fullname,email,phone,address,max_shop_count,backup_id):
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
                "CALL public.sp_update_owner(%s, %s, %s, %s, %s, %s,%s, %s, NULL, NULL, NULL, NULL , NULL, NULL, NULL, NULL, NULL);",
                (admin_user_id, owner_id, fullname, email, phone, address , max_shop_count, backup_id)
            )
            result = cur.fetchone()
            if result:  
                (
                        status_code,
                        status_message,
                        out_owner_id,
                        out_fullname,
                        out_email,
                        out_phone,
                        out_address,
                        out_max_shop_count,
                        out_backup_id
                    ) = result  
                print("Status Code:", status_code)
                print("Message:", status_message)

                if status_code == "SUCCESS":
                    con.commit()
                    con.close()
                    print("Owner Updated Successfully.")
                    return {
                            "status": 200,
                            "message": status_message,
                            "data": {
                                "owner_id": out_owner_id,
                                "fullname": out_fullname,
                                "email": out_email,
                                "phone": out_phone,
                                "address": out_address,
                                "max_shop_count": out_max_shop_count,
                                "backup_id": out_backup_id
                            }
                        }
                else:
                    con.rollback()
                    con.close()
                    print(f"Owner Update Failed Reason : {status_message}")
                    return {"status": 404, "error": status_code, "message": status_message}
            else:
                return {"status": 404, "error": "No Response From DB"}
                
          except Exception as e:
            print(f"Error in database query: {e}")
            return {"status": 404, "error": "Error While Executing The Query"}
                
    finally:
       if con:
           con.close() 