from fastapi import APIRouter, Depends, HTTPException, status
from Library.Security.gatekeeper import require_active_user
from .models import UpdateUserRequest, JoinQueueRequest
from .utility import update_user as update_user_details, join_queue, get_shop_by_id

router = APIRouter()

# Update profile of currently logged-in user
@router.put("/update")
def update_user(data: UpdateUserRequest, user_id: int = Depends(require_active_user)):
    payload = data.model_dump()
    payload["user_id"] = user_id
    response = update_user_details(payload)
    return response

# Customer Join Queue (supports both /queue and /queue/join)
@router.post("/queue")
@router.post("/queue/join")
def customer_join_queue(
    data: JoinQueueRequest,
    user_id: int = Depends(require_active_user)
):
    payload = data.model_dump()
    payload["user_id"] = user_id
    response = join_queue(payload)
    return response

# Get shop details by id
@router.get("/shops/{id}")
def get_shop_by_id_route(id: int, _: int = Depends(require_active_user)):
    response = get_shop_by_id(id)

    if response.get("status") == 404:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=response.get("message", "Shop not found")
        )
    if response.get("status") == 400:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=response.get("message", "Bad request")
        )
    if response.get("status") != 200:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=response.get("message", "Internal server error")
        )

    return response
