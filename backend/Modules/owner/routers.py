from fastapi import APIRouter, Depends
from Library.Security.gatekeeper import require_admin
from .models import AddOwnerRequest, DeleteOwnerRequest, OwnerDetail,UpdateOwnerStatusRequest
from .utility import register_owner,update_owner_status as update_o_status,delete_owner as delete_own
from .database import get_all_owners_details

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

@router.put("/status")
def update_owner_status(data: UpdateOwnerStatusRequest, admin_id: int = Depends(require_admin)):
    payload = data.model_dump()
    payload["admin_id"] = admin_id
    response = update_o_status(payload)
    return response

@router.delete("/delete")
def delete_owner(data: DeleteOwnerRequest, admin_id: int = Depends(require_admin)):
    payload = {
        "admin_user_id": admin_id,
        "owner_id": data.owner_id
    }
    response = delete_own(payload)
    return response
