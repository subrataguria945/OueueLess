from fastapi import APIRouter
from .models import UserLogin , ChangePassword , ResetPassword , VerifyRegistrationOTP , InitiateUserRegister , UserRegisterGoogle
from Library.Authentication.user.utility import login_user as login , change_password , initiate_register , veriy_and_register_user , register_google_user

router = APIRouter()

@router.post("/login")
def login_user(data : UserLogin):
    response = login(data.model_dump())
    return response

@router.post("/register/google")
def register_google(data : UserRegisterGoogle):
    response = register_google_user(data.model_dump())
    return response

@router.post("/register/initiate")
def register_initiate(data : InitiateUserRegister):
    response = initiate_register(data.model_dump())
    return response

@router.post("/register/verify")
def register_verify(data : VerifyRegistrationOTP):
    response = veriy_and_register_user(data.model_dump())
    return response

@router.post("/password")
def change_or_reset_password(data : ChangePassword | ResetPassword):
    data = data.model_dump()
    if data["action"].upper() == "CHANGE":
        response = change_password(data)
    # elif data["action"].upper() == "RESET":
    #     response = reset_password(data)
    return response