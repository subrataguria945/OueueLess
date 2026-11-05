from fastapi import APIRouter
from .models import AddOwnerRequest
from .utility import register_owner

router = APIRouter()

@router.post("/register/owner")
def add_owner(data : AddOwnerRequest):
    response = register_owner(data.model_dump())
    return response  