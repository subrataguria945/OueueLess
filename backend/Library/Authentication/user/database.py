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
                cur.execute("CALL public.sp_login(%s,%s,   NULL,  NULL,  NULL,NULL  );",(email,password))
                result = cur.fetchone()
                if result:
                    user_id, user_role , status_code, status_message = result
                    print("User ID:", user_id)
                    print("Role" , user_role)
                    print("Status Code:", status_code)
                    print("Message:", status_message)

                    if status_code == "SUCCESS":
                        print("Login Successfull.")
                        return {"status": 200 , "user_id" : user_id, "user_role" : user_role , "message" : status_message}
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


def insert_user_indb(fullname , email , phone , password , role_id):
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
                cur.execute("CALL public.sp_register_user(%s,%s,%s,%s,%s,NULL,NULL,NULL);",(fullname,email,phone,password,role_id))
                result = cur.fetchone()
                if result:
                    user_id,status_code, status_message = result
                    print("User ID:", user_id)
                    print("Status Code:", status_code)
                    print("Message:", status_message)

                    if status_code == "SUCCESS":
                        con.commit()
                        con.close()
                        print("Registration Successfull.")
                        return {"status": 200 , "user_id" : user_id, "message" : status_message}
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
                cur.execute("CALL public.sp_manage_password(%s,%s,%s,%s,NULL,NULL,NULL);",(userid,action,oldpassword,newpassword))
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