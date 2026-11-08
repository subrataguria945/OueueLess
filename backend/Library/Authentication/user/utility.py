from Library.Authentication.user.database import update_user_indb, user_exists_indb, validate_login_indb , insert_user_indb , change_password_indb , update_refresh_token_indb, check_google_account
from Library.Security.JWT import generate_access_token , generate_forget_password_token, generate_signup_token , decode_access_token , decode_forget_password_token , decode_refresh_token , generate_refresh_token
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
        access_token = generate_access_token(response.get("user_id"),email)
        refresh_token = generate_refresh_token(response.get("user_id"),email)
        update_refresh_token_indb(response.get("user_id"),refresh_token)
        return {
            "status" : "success",
            "user_id": response.get("user_id"),
            "user_role": response.get("user_role"),
            "fullname": response.get("full_name"),
            "email": response.get("email"),
            "phone": response.get("phone"),
            "profile_image": response.get("profile_image"),
            "address": response.get("address"),
            "joined_date": response.get("joined_date"),
            "message": response.get("message"),
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type" : "bearer"
        }
    else:
        return {
            "status" : "Login Failed",
            "message" : response.get("error")
        }


def manage_google_user(input : dict ):
    response = check_google_account(input.get("fullname"),input.get("email"), input.get("google_id"))
    if response.get("status") == 200:   
        access_token = generate_access_token(response.get("user_id"),input.get("email"))
        refresh_token = generate_refresh_token(response.get("user_id"),input.get("email"))
        update_refresh_token_indb(response.get("user_id"),refresh_token)
        return {
            "status" : "success",
            "user_id": response.get("user_id"),
            "user_role":response.get("role_id"),
            "email": input.get("email"),
            "message": response.get("message"),
            "access_token": access_token,
            "refresh_token":refresh_token,
            "token_type" : "bearer"
        }
    else:
        return response
    
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
    response = user_exists_indb(input.get("email"))
    if response.get("status") == 200:
        return {
            "status" : "Registration Failed",
            "message" : "User already exists"
        }

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
    
    payload = decode_access_token(signup_token)
    if "error" in payload:
        return { "status" : "failed" , "message" : payload["error"]}
    
    otp_hash = hashlib.sha256(otp.strip().encode()).hexdigest()
    if otp_hash != payload["otp_hash"]:
        return { "status" : "failed" , "message" : "Invalid OTP"}
    
    user_data = payload["user_data"]
    full_name = user_data.get("fullname")
    email = user_data.get("email")
    phone = user_data.get("phone")

    response = insert_user_indb(full_name,email,phone,password)
    if response.get("status") == 200:
        token = generate_access_token(response.get("user_id"),email)
        refresh_token = generate_refresh_token(response.get("user_id"),email)
        update_refresh_token_indb(response.get("user_id"),refresh_token)
        return {
            "status" : "success",
            "user_id": response.get("user_id"),
            "user_role": response.get("role_id"),
            "email": email,
            "message": response.get("message"),
            "access_token": token,
            "refresh_token": refresh_token,
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


def refresh_user_token(input: dict):
    refresh_token = input.get("refresh_token")
    payload = decode_refresh_token(refresh_token)

    if "error" in payload:
        return {
            "status": "failed",
            "message": payload["error"]
        }
    user_id = payload.get("user_id")
    email = payload.get("email")
    new_access_token = generate_access_token(user_id, email)
    return {
        "status": "success",
        "message": "Token refreshed successfully",
        "access_token": new_access_token,
        "token_type": "bearer"
    }

def update_user(input:dict):
    user_id = input.get("user_id")
    fullname = input.get("fullname")
    phone = input.get("phone")
    profile_image = input.get("profile_image")
    address = input.get("address")
    response = update_user_indb(user_id, fullname, phone, profile_image,address)
    if response.get("status") == 200:
        return {
            "status": "success",
            "message": response.get("message")
        }
    else:
        return {
            "status": "failed",
            "message": response.get("error")
        }