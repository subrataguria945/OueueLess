from fastapi import APIRouter, Depends
from Library.Security.gatekeeper import require_active_user
from .models import GetShops, ShopDetails
from .utility import get_shop_details

router = APIRouter()







@router.get("/shops", response_model=list[ShopDetails])
def get_shop(data: GetShops = Depends(), user_id: int = Depends(require_active_user)):
    return get_shop_details(data.owner_id, user_id)



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
