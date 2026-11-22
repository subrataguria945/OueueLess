from fastapi import APIRouter, Depends
from Library.Security.gatekeeper import require_active_user
from .models import UpdateUserRequest, JoinQueueRequest
from .utility import update_user as update_user_details, join_queue

router = APIRouter()

# Update profile of currently logged-in user
@router.put("/update")
def update_user(data: UpdateUserRequest, user_id: int = Depends(require_active_user)):
    payload = data.model_dump()
    payload["user_id"] = user_id
    response = update_user_details(payload)
    return response

# Customer Join Queue
@router.post("/queue/join")
def customer_join_queue(
    data: JoinQueueRequest,
    user_id: int = Depends(require_active_user)
):
    payload = data.model_dump()
    payload["user_id"] = user_id

    response = join_queue(payload)

    return response
