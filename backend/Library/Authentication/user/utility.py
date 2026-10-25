from Library.Authentication.user.database import validate_login_indb , insert_user_indb , change_password_indb
from Library.Security.JWT import generate_jwt_token

def login_user(input : dict ):
    input = dict(input)
    email = input.get("email")
    password = input.get("password")
    response = validate_login_indb(email,password)
    if response.get("status") == 200:
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


def register_user(input):
    input = dict(input)
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
            "status" : "success",
            "user_id": response.get("user_id"),
            "email": email,
            "message": response.get("message")
        }
    else:
        return {
            "status" : "Registration Failed",
            "message" : response.get("error")
        }
  
def change_password(input : dict):
    input = dict(input)
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
            