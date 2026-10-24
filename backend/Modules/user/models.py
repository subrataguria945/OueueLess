from pydantic import BaseModel , EmailStr

class UserLogin(BaseModel):
    email : EmailStr
    password : str  

class UserRegister(BaseModel):
    fullname : str
    phone : int 
    email : EmailStr
    password : str 
    confirm_password : str
    