from pydantic import BaseModel , EmailStr 
from datetime import datetime


class UserLogin(BaseModel):
    email : EmailStr
    password : str  

# normal user ee google diye login korte parbe only 
class UserRegisterGoogle(BaseModel):
    fullname : str
    email : EmailStr
    google_id : str


class VerifyRegistrationOTP(BaseModel):
    signup_token : str
    otp : str   
    password : str 

class InitiateUserRegister(BaseModel):
    fullname : str
    email : EmailStr
    phone : str | None = None

  
class ChangePassword(BaseModel):
    email : EmailStr | None = None
    oldpassword : str
    newpassword : str

class ResetPassword(BaseModel):
    reset_token  : str
    newpassword : str
    confirm_password : str

class ForgetPassword(BaseModel):
    email : EmailStr

class RefreshTokenRequest(BaseModel):
    refresh_token : str


# Request schema for toggling owner active/inactive status
class UpdateOwnerStatusRequest(BaseModel):
    owner_id: int   
    new_status: bool
