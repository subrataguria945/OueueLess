from dns import message
import psycopg
from dotenv import load_dotenv
import os 
from Library.Security.JWT import generate_jwt_token

load_dotenv()
def validate_login_indb(email,password):
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
        return 
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


def login_user(input : dict ):
    input = dict(input)
    email = input.get("email")
    password = input.get("password")

    response = validate_login_indb(email,password)
    if response.get("status") == 200:
        pass
        token = generate_jwt_token(email,password)
        return {
            "status" : "success",
            "user_id": response.get("user_id"),
            "user_role":response.get("user_role"),
            "email": email,
            "message": response.get("message"),
            "access_token": token,
            "token_type" : "bearer" ,
            
        }
    else:
        return {
            "status" : "Login Failed",
            "message" : response.get("error")
        }
# CALL public.sp_login('admin@example.com', 'Admin@123',   NULL,  NULL,  NULL,NULL  );
