from fastapi import APIRouter
from .models import UserLogin
from Library.Authentication.user import login_user as login
 
router = APIRouter()

@router.post("/login")
def login_user(dict : UserLogin):
    response = login(dict)
    return response
