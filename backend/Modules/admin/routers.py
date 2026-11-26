from fastapi import APIRouter, Depends
from Library.Security.gatekeeper import require_admin
from .models import (
    ShopDetails,
    AllUserDetailsResponse,
    OwnerDetail,
    AddOwnerRequest,
    UpdateOwner,
    UpdateUser,
    UpdateOwnerStatusRequest,
    UpdateUserStatusRequest,
)
from .database import (
    get_all_shop_details,
    get_all_users_details,
    get_all_owners_details,
)
from .utility import (
    register_owner,
    update_owner as update_own,
    update_user as update_usr,
    update_owner_status as update_o_status,
    update_user_status as update_u_status,
)

router = APIRouter()


@router.get("/shops", response_model=list[ShopDetails])
@router.get("/shops/all", response_model=list[ShopDetails])
def get_shops(admin_id: int = Depends(require_admin)):
    return get_all_shop_details(admin_id)


# Get list of all users (Admin only)
@router.get("/users", response_model=AllUserDetailsResponse)
@router.get("/users/all", response_model=AllUserDetailsResponse)
def get_all_users(admin_id: int = Depends(require_admin)):
    response = get_all_users_details(admin_id)
    return response


# Get list of all owners with shops (Admin only)
@router.get("/owners", response_model=list[OwnerDetail])
@router.get("/owners/all", response_model=list[OwnerDetail])
def list_owners(admin_id: int = Depends(require_admin)):
    return get_all_owners_details(admin_id)


# Register a new owner (Admin only)
@router.post("/owner/add")
def add_owner(data: AddOwnerRequest, admin_id: int = Depends(require_admin)):
    payload = data.model_dump()
    payload["admin_id"] = admin_id
    response = register_owner(payload)
    return response


# Update owner profile details (Admin only)
@router.put("/owner/update")
def update_owner(data: UpdateOwner, admin_id: int = Depends(require_admin)):
    payload = data.model_dump()
    payload["admin_id"] = admin_id
    response = update_own(payload)
    return response


@router.put("/user/update")
def update_user(data: UpdateUser, admin_id: int = Depends(require_admin)):
    payload = data.model_dump()
    payload["admin_id"] = admin_id
    response = update_usr(payload)
    return response


# Update owner active/inactive status (Admin only)
@router.put("/owner/status")
def update_owner_status(
    data: UpdateOwnerStatusRequest, admin_id: int = Depends(require_admin)
):
    payload = data.model_dump()
    payload["admin_id"] = admin_id
    response = update_o_status(payload)
    return response


# Update owner active/inactive status (Admin only)
@router.put("/user/status")
def update_user_status(
    data: UpdateUserStatusRequest, admin_id: int = Depends(require_admin)
):
    payload = data.model_dump()
    payload["admin_id"] = admin_id
    response = update_u_status(payload)
    return response
