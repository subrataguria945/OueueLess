from Library.Authentication.user.database import validate_login_indb , insert_user_indb , change_password_indb
from Library.Security.JWT import generate_access_token , generate_signup_token , decode_token
import secrets
import hashlib
def login_user(input : dict ):
    email = input.get("email")
    password = input.get("password")
    response = validate_login_indb(email,password)
    if response.get("status") == 200:
        token = generate_access_token(response.get("user_id"),email)
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


def register_user(input : dict ):
    fullname = input.get("fullname")
    email = input.get("email")
    phone = input.get("phone")
    password = input.get("password")
    confirm_password = input.get("confirm_password")
    if password != confirm_password:
        return {
            "status" : "Registration Failed",
            "message" : "Password and Confirm Password are not same"
        }
    role_id = input.get("user_role")
    response = insert_user_indb(fullname,email,phone,password,role_id)
    if response.get("status") == 200:
        return {
            "status" : 200,
            "user_id": response.get("user_id"),
            "message": response.get("message")
        }
    else:
        return {
            "status" : "Registration Failed",
            "message" : response.get("error")
        }
  
def change_password(input : dict):
    userid = input.get("userid")
    action = input.get("action")
    oldpassword = input.get("oldpassword")
    newpassword = input.get("newpassword")
    if oldpassword == newpassword:
        return {
            "status" : "Change Password Failed",
            "message" : "Old Password and New Password are not same"
        }
    else:
        response = change_password_indb(userid,action,oldpassword,newpassword)
        if response.get("status") == 200:
            return {
                "status" : "success",
                "message" : response.get("message")
            }
        else:
            return {
                "status" : "Change Password Failed",
                "message" : response.get("error")
            }
            
def initiate_register(input: dict):

    otp = str(secrets.randbelow(900000) + 100000)
    otp_hash = hashlib.sha256(otp.encode()).hexdigest()

    print("OTP:", otp)
    print("OTP Hash:", otp_hash)
    # email send

    token = generate_signup_token(input , otp_hash)

    return {
        "status" : "success",
        "message" : "OTP sent to your email. Please verify within 5 minutes",
        "token" : token
    }

# Signup token - userdata , otphash , exp , iat
def veriy_and_register_user(input : dict ):
    signup_token = input.get("signup_token")
    otp = input.get("otp")
    password = input.get("password")
    
    payload = decode_token(signup_token)
    if "error" in payload:
        return { "status" : "failed" , "message" : payload["error"]}
    
    otp_hash = hashlib.sha256(otp.strip().encode()).hexdigest()
    if otp_hash != payload["otp_hash"]:
        return { "status" : "failed" , "message" : "Invalid OTP"}
    
    user_data = payload["user_data"]
    full_name = user_data.get("fullname")
    email = user_data.get("email")
    phone = user_data.get("phone")
    role_id = user_data.get("user_role")

    response = insert_user_indb(full_name,email,phone,password,role_id)
    if response.get("status") == 200:
        token = generate_access_token(response.get("user_id"),email)
        return {
            "status" : "success",
            "user_id": response.get("user_id"),
            "user_role": role_id,
            "email": email,
            "message": response.get("message"),
            "access_token": token,
            "token_type" : "bearer"
        }
    else:
        return {
            "status" : "Registration Failed",
            "message" : response.get("error")
        }   