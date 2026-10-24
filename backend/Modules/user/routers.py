from fastapi import APIRouter
from .models import UserLogin , UserRegister
from Library.Authentication.user import login_user as login , register_user as register

router = APIRouter()

@router.post("/login")
def login_user(dict : UserLogin):
    response = login(dict)
    return response

@router.post("/register")
def register_user(dict : UserRegister):
    response = register(dict)
    return response