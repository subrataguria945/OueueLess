from fastapi import APIRouter, Depends, HTTPException, status

from Library.Security.gatekeeper import require_active_user
from .models import CreateShopRequest
from .utility import create_shop

router = APIRouter()


@router.post("/create", status_code=status.HTTP_201_CREATED)
def create_shop_route(
    data: CreateShopRequest,
    user_id: int = Depends(require_active_user),
):
    result = create_shop(user_id, data.model_dump())

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="An active owner account is required to create a shop.",
        )

    if result["status_code"] == 1:
        return {
            "status": "success",
            "shop_id": result["shop_id"],
            "message": result["message"],
        }

    if result["status_code"] == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"],
        )

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Shop creation failed due to a database error.",
    )