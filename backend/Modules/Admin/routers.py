from fastapi import APIRouter, Depends
from Library.Security.gatekeeper import require_admin
from .models import ShopDetails , AllUserDetailsResponse , OwnerDetail
from .database import get_all_shop_details , get_all_users_details , get_all_owners_details

router = APIRouter()

@router.get("/shops/all", response_model=list[ShopDetails])
def get_shops(admin_id: int = Depends(require_admin)):
    return get_all_shop_details(admin_id)

# Get list of all users (Admin only)
@router.get("/users/all", response_model=AllUserDetailsResponse)
def get_all_users(admin_id: int = Depends(require_admin)):
    response = get_all_users_details(admin_id)
    return response

# Get list of all owners with shops (Admin only)
@router.get("/owners/all", response_model=list[OwnerDetail])
def list_owners(admin_id: int = Depends(require_admin)):
    return get_all_owners_details(admin_id)