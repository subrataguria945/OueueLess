import psycopg
from dotenv import load_dotenv
import os
load_dotenv()
def validate_login_indb(email,password):
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
        return {"status" : 404 , "error" : "Error While Connecting DB"}
    else:
        with con.cursor() as cur:
            try:
                cur.execute(
                    "CALL public.sp_login(%s, %s, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);",
                    (email, password)
                )
                result = cur.fetchone()
                if result:
                    (
                        user_id,
                        user_role,
                        full_name,
                        user_email,
                        phone,
                        profile_image,
                        address,
                        joined_date,
                        status_code,
                        status_message,
                    ) = result
                    print("User ID:", user_id)
                    print("Role:", user_role)
                    print("Status Code:", status_code)
                    print("Message:", status_message)

                    if status_code == "SUCCESS":
                        print("Login Successfull.")
                        formatted_joined_date = (
                            joined_date.isoformat()
                            if hasattr(joined_date, "isoformat")
                            else str(joined_date) if joined_date else None
                        )
                        return {
                            "status": 200,
                            "user_id": user_id,
                            "user_role": user_role,
                            "full_name": full_name,
                            "email": user_email or email,
                            "phone": phone,
                            "profile_image": profile_image,
                            "address": address,
                            "joined_date": formatted_joined_date,
                            "message": status_message,
                        }
                    else:
                        print(f"Login Denied Reason : {status_message}")
                        return {"status" : 404 , "error" : status_code , "message" : status_message}
                else:
                    return {"status" : 404, "error" : "No Response From DB"}

            except Exception as e:
                print(f"Error in database query: {e}")
                return {"status" : 404, "error" : "Error While Executing The Query"}
    finally:
        if con : 
            con.close()


def insert_user_indb(fullname , email , phone , password):
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
         return {"status" : 404 , "error" : "Error While Connecting DB"}
    else:               
        with con.cursor() as cur:
            try:
                cur.execute("CALL public.sp_register_user(%s,%s,%s,%s,NULL,NULL,NULL,NULL);",(fullname,email,phone,password))
                result = cur.fetchone()
                if result:
                    user_id, role_id, status_code, status_message = result
                    print("User ID:", user_id)
                    print("Role ID:", role_id)
                    print("Status Code:", status_code)
                    print("Message:", status_message)

                    if status_code == "SUCCESS":
                        con.commit()
                        con.close()
                        print("Registration Successfull.")
                        return {"status": 200 , "user_id" : user_id, "role_id": role_id, "message" : status_message}
                    else:
                        con.rollback()
                        con.close()
                        print(f"Registration Failed Reason : {status_message}")
                        return {"status" : 404 , "error" : status_code , "message" : status_message}
                else:
                    return {"status" : 404, "error" : "No Response From DB"}
            except Exception as e:
                print(f"Error in database query: {e}")
                return {"status" : 404, "error" : "Error While Executing The Query"}
    finally:
        if con :
            con.close()
            
def change_password_indb(userid,action,oldpassword,newpassword):
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
         return {"status" : 404 , "error" : "Error While Connecting DB"}
    else:
        with con.cursor() as cur:
            try:
                cur.execute("CALL public.sp_manage_password(%s,%s,%s,%s,NULL,NULL);",(userid,action,oldpassword,newpassword))
                result = cur.fetchone()
                if result:
                    status_code, status_message = result
                    print("Status Code:", status_code)
                    print("Message:", status_message)

                    if status_code == "SUCCESS":
                        con.commit()
                        con.close()
                        print("Password Changed Successfully.")
                        return {"status": 200 , "message" : status_message}
                    else:
                        con.rollback()
                        con.close()
                        print(f"Password Change Failed Reason : {status_message}")
                        return {"status" : 404 , "error" : status_code , "message" : status_message}
                else:
                    return {"status" : 404, "error" : "No Response From DB"}
            except Exception as e:
                print(f"Error in database query: {e}")
                return {"status" : 404, "error" : "Error While Executing The Query"}
    finally:
        if con: 
            con.close()

def user_exists_indb(email):
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
         return {"status" : 404 , "error" : "Error While Connecting DB"}
    else:
        with con.cursor() as cur:
            try:
                cur.execute("SELECT userid FROM public.users WHERE email = %s;",(email,))
                result = cur.fetchone()
                if result:
                    return {"status": 200 , "user_id" : result[0]}
                else:
                    return {"status" : 404, "error" : "No Response From DB"}
            except Exception as e:
                print(f"Error in database query: {e}")
                return {"status" : 404, "error" : "Error While Executing The Query"}
    finally:
        if con: 
            con.close()

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

def update_refresh_token_indb(user_id : int , refresh_token : str):
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
                    "CALL public.sp_update_refresh_token(%s,%s,NULL,NULL);",
                    (user_id,refresh_token),
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

def check_google_account(fullname,email,google_id):
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
         return {"status" : 404 , "error" : "Error While Connecting DB"}
    else:
        with con.cursor() as cur:
            try:
                cur.execute("CALL public.sp_google_auth(%s, %s, %s, NULL, NULL, NULL, NULL);",(fullname, email, google_id))
                result = cur.fetchone()
                if result:
                    user_id, role_id, status_code, status_message = result
                    print("User ID:", user_id)
                    print("Role ID:", role_id)
                    print("Status Code:", status_code)
                    print("Message:", status_message)
                    if status_code in ("SUCCESS_LOGIN", "SUCCESS_REGISTER"):
                        con.commit()
                        return {
                            "status": 200,
                            "status_code": status_code,
                            "user_id": user_id,
                            "role_id": role_id,
                            "message": status_message
                        }
                    else:
                        con.rollback()
                        return {
                            "status": 400,
                            "status_code": status_code,
                            "error": status_message
                        }
                else:
                    return {"status": 500, "error": "No response from database"}
            except Exception as e:
                con.rollback()
                print(f"Error in database query: {e}")
                return {"status": 500, "error": "Error while executing query"}
    finally:
        if con:
            con.close()