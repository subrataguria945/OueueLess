from fastapi import APIRouter, Depends
from Library.Owner.database import get_all_owners_details
from Library.Security.gatekeeper import require_admin
from .models import AddOwnerRequest, OwnerDetail
from .utility import register_owner

router = APIRouter()

@router.post("/add")
def add_owner(data: AddOwnerRequest, _: int = Depends(require_admin)):
    response = register_owner(data.model_dump())
    return response

@router.get("/all", response_model=list[OwnerDetail])
def list_owners(_: int = Depends(require_admin)):
    return get_all_owners_details()



