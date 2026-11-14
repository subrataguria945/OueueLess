from fastapi import APIRouter, Depends
from Library.Security.gatekeeper import require_admin
from .models import AddOwnerRequest, UpdateOwner, OwnerDetail,UpdateOwnerStatusRequest
from .utility import register_owner,update_owner_status as update_o_status,update_owner as update_own
from .database import get_all_owners_details 

router = APIRouter()

# Register a new owner (Admin only)
@router.post("/add")
def add_owner(data: AddOwnerRequest, admin_id : int = Depends(require_admin)):
    payload = data.model_dump()
    payload["admin_id"] = admin_id
    response = register_owner(payload)
    return response

# Get list of all owners with shops (Admin only)
@router.get("/all", response_model=list[OwnerDetail])
def list_owners(admin_id: int = Depends(require_admin)):
    return get_all_owners_details(admin_id)

# Update owner active/inactive status (Admin only)
@router.put("/status")
def update_owner_status(data: UpdateOwnerStatusRequest, admin_id: int = Depends(require_admin)):
    payload = data.model_dump()
    payload["admin_id"] = admin_id
    response = update_o_status(payload)
    return response

# Update owner profile details (Admin only)
@router.put("/update")
def update_owner(data : UpdateOwner, admin_id : int = Depends(require_admin)):
    payload = data.model_dump()
    payload["admin_id"] = admin_id
    response = update_own(payload)
    return response

# Owner hard-delete route (disabled; soft status update preferred)
# @router.delete("/delete")
# def delete_owner(data: DeleteOwnerRequest, admin_id: int = Depends(require_admin)):
#     payload = {
#         "user_id": data.user_id,
#         "owner_id": data.owner_id,
#         "admin_id": admin_id
#     }   
#     response = delete_own(payload)
#     return response
