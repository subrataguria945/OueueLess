from Library.Authentication.user.database import insert_owner_indb, user_exists_indb, validate_login_indb , insert_user_indb , change_password_indb
from Library.Security.JWT import generate_access_token , generate_forget_password_token, generate_signup_token , decode_token , decode_forget_password_token
import secrets
import hashlib
from Library.Notification.email import send_otp_email , send_reset_password_email
from dotenv import load_dotenv
load_dotenv() 
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


def register_google_user(input : dict ):
    response = user_exists_indb(input.get("email"))
    if response.get("status") == 200:
        return login_user(input)

    else:
        fullname = input.get("fullname")
        email = input.get("email")
        password = input.get("password")
        confirm_password = input.get("confirm_password")
        if password != confirm_password:
            return {
                "status" : "Registration Failed",
                "message" : "Password and Confirm Password are not same"
            }
        role_id = input.get("user_role")
        phone = None
        response = insert_user_indb(fullname,email,phone,password,role_id)
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
    
def change_password(input : dict):
    userid = input.get("userid")
    oldpassword = input.get("oldpassword")
    newpassword = input.get("newpassword")
    if oldpassword == newpassword:
        return {
            "status" : "Change Password Failed",
            "message" : "Old Password and New Password are not same"
        }
    else:
        response = change_password_indb(userid,"CHANGE",oldpassword,newpassword)
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
    email = input.get("email")

    send_otp_email(to_email=email, otp = otp    )
    
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

def check_and_send_forget_password_link(input : dict):
    email = input.get("email")
    response = user_exists_indb(email)
    if response.get("status") == 200:
        forget_password_token = generate_forget_password_token(email , response.get("user_id"))
        if send_reset_password_email(email,forget_password_token):
            return {
                "status" : "success",
                "message" : "Reset password link sent to your email"
            }
        else:
            return {
                "status" : "failed",
                "message" : "Failed to send reset password link"
            }
    else:
        return {
            "status" : "failed",
            "message" : "User does not exist"
        }
    

def reset_password(input : dict):
    reset_token = input.get("reset_token")
    newpassword = input.get("newpassword")
    confirm_password = input.get("confirm_password")
    if newpassword != confirm_password:
        return {
            "status" : "failed",
            "message" : "Password and Confirm Password are not same"
        }
    else:
        payload = decode_forget_password_token(reset_token)
        if "error" in payload:
            return { "status" : "failed" , "message" : payload["error"]}
        response = change_password_indb(payload.get("user_id"), "RESET", None, newpassword)
        if response.get("status") == 200:
            return {
                "status" : "success",
                "message" : response.get("message")
            }
        else:
            return {
                "status" : "failed",
                "message" : response.get("error")
            }  


def register_owner(input: dict):
    admin_user_id = input.get("admin_user_id")
    fullname = input.get("fullname")
    email = input.get("email")
    phone = input.get("phone")
    password = input.get("password")
    max_shop_count = input.get("max_shop_count")
    backup_id = input.get("backup_id")

    response = insert_owner_indb(admin_user_id, fullname, email, phone, password, max_shop_count, backup_id)
    if response.get("status") == 200:
        return {
            "status" : "success",
            "new_owner_id": response.get("new_owner_id"),
            "new_user_id": response.get("new_user_id"),
            "message": response.get("message")
        }
    else:
        return {
            "status" : "failed",
            "message" : response.get("error")
        }