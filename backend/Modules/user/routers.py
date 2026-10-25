from fastapi import APIRouter
from .models import UserLogin , UserRegister , ChangeOrResetPassword
from Library.Authentication.user.utility import login_user as login , register_user as register , change_password

router = APIRouter()

@router.post("/login")
def login_user(dict : UserLogin):
    response = login(dict)
    return response

@router.post("/register")
def register_user(dict : UserRegister):
    response = register(dict)
    return response

@router.post("/password")
def change_or_reset_password(input : ChangeOrResetPassword):
    input = dict(input)
    if input["action"].upper() == "CHANGE":
        response = change_password(input)
    # elif input["action"].upper() == "RESET":
    #     response = reset_password(input)
    return response