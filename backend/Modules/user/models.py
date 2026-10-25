from pydantic import BaseModel , EmailStr

class UserLogin(BaseModel):
    email : EmailStr
    password : str  

class UserRegister(BaseModel):
    fullname : str
    email : EmailStr
    phone : str
    password : str 
    confirm_password : str
    user_role: int

class ChangeOrResetPassword(BaseModel):
    userid : int
    action : str
    oldpassword : str
    newpassword : str
