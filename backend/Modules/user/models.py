from pydantic import BaseModel , EmailStr , field_validator
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
    userid : int
    email : EmailStr
    action : Literal["CHANGE", "RESET"]
    oldpassword : str
    newpassword : str

    @field_validator("action", mode="before")
    def to_uppercase(cls, v):
        if isinstance(v, str):
            return v.upper()
        return v

class ResetPassword(BaseModel):
    email : EmailStr
    action : Literal["RESET"]
    