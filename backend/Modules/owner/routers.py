from fastapi import APIRouter, Depends
from Library.Owner.database import get_all_owners_details
from Library.Security.gatekeeper import require_admin
from .models import AddOwnerRequest, OwnerDetail,UpdateOwnerStatusRequest
from .utility import register_owner,update_owner_status

router = APIRouter()

@router.post("/add")
def add_owner(data: AddOwnerRequest, admin_id : int = Depends(require_admin)):
    payload = data.model_dump()
    payload["admin_id"] = admin_id
    response = register_owner(payload)
    return response

@router.get("/all", response_model=list[OwnerDetail])
def list_owners(_: int = Depends(require_admin)):
    return get_all_owners_details()

@router.put("/update_owner_status")
def update_owner_status(data: UpdateOwnerStatusRequest, admin_id: int = Depends(require_admin)):
    payload = data.model_dump()
    payload["admin_id"] = admin_id
    response = update_owner_status(payload)
    return response
