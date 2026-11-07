from pydantic import BaseModel , EmailStr 

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
    phone : str

  
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

class RefreshTokenRequest(BaseModel):
    refresh_token : str

class UpdateUserRequest(BaseModel):
    fullname : str
    phone : str
    profile_image : str    
    address : str