from pydantic import BaseModel , EmailStr 
from typing import Literal

class UserLogin(BaseModel):
    email : EmailStr
    password : str  

class UserRegisterGoogle(BaseModel):
    fullname : str
    email : EmailStr
    password : str 
    confirm_password : str
    user_role: Literal[2, 3]
    


class VerifyRegistrationOTP(BaseModel):
    signup_token : str
    otp : str   
    password : str 

class InitiateUserRegister(BaseModel):
    fullname : str
    email : EmailStr
    phone : str
    user_role: Literal[2, 3]

  
class ChangePassword(BaseModel):
    email : EmailStr
    oldpassword : str
    newpassword : str

class ResetPassword(BaseModel):
    reset_token  : str
    newpassword : str
    confirm_password : str

class ForgetPassword(BaseModel):
    email : EmailStr

class AddOwnerRequest(BaseModel):
    admin_user_id: int
    fullname: str
    email: EmailStr
    password: str
    phone: str
    max_shop_count: int
    backup_id:int   

class RefreshTokenRequest(BaseModel):
    refresh_token : str

class UpdateUserRequest(BaseModel):
    user_id : int
    fullname : str
    phone : str
    profile_image : str    