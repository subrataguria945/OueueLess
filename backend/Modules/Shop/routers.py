from fastapi import APIRouter, Depends, HTTPException, status,Query

from Library.Security.gatekeeper import require_active_user
from .models import CreateShopRequest, DeleteShopRequest, UpdateShopRequest
from .utility import create_shop, delete_shop, update_shop, get_active_shops

router = APIRouter()


#create shop route---------------------------
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
        message = result["message"]

        if message in {
            "Maximum shop creation limit reached.",
            "A shop with this name already exists for this owner.",
            "Duplicate record detected. Shop creation rejected.",
        }:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=message,
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Shop creation failed due to a database error.",
    )


@router.put("/update")
def update_shop_route(
    data: UpdateShopRequest,
    user_id: int = Depends(require_active_user),
):
    payload = data.model_dump(exclude={"shop_id"})
    result = update_shop(user_id, data.shop_id, payload)

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="An active owner account is required to update a shop.",
        )

    if result["status_code"] == 1:
        return {
            "status": "success",
            "message": result["message"],
        }

    if result["status_code"] == 0:
        message = result["message"]

        if message == "Shop does not exist or does not belong to this owner.":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=message,
            )

        if (
            "already exists" in message
            or "Duplicate record detected" in message
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=message,
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Shop update failed due to a database error.",
    )


# Deactivate shop route
@router.put("/status")
def delete_shop_route(
    data: DeleteShopRequest,
    user_id: int = Depends(require_active_user),
):
    result = delete_shop(user_id, data.shop_id)

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="An active owner account is required to deactivate a shop.",
        )

    if result["status_code"] == 1:
        return {
            "status": "success",
            "message": result["message"],
        }

    if result["status_code"] == 0:
        message = result["message"]

        if message == "Shop does not exist or does not belong to this owner.":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=message,
            )

        if message == "Shop is already inactive.":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=message,
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Shop deactivation failed due to a database error.",
    )
@router.get("/activeshops-by-pincode")
def get_active_shops_route(
    pincode: str = Query(
        ...,
        min_length=6,
        max_length=6,
        pattern=r"^\d{6}$",
        description="6-digit Indian pincode",
    ),
):
    result = get_active_shops(pincode)

    status_code = result["status_code"]
    message = result["message"]

    if status_code == 1:
        return {
            "status": "success",
            "message": message,
            "shops": result["shops"],
        }

    if status_code == 0:
        if message == "Pincode is required.":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message,
            )

        if message == "Invalid pincode. Enter a valid 6-digit pincode.":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message,
            )

        if message == "Invalid shop status detected. Inactive shops cannot have an open queue.":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=message,
            )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=message,
        )

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=message or "Unable to retrieve active shops.",
    )